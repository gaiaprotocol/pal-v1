// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PalUserToken.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

contract Pal is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using AddressUpgradeable for address payable;

    address payable public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public tokenOwnerFeePercent;

    IERC20 public membershipToken;
    uint256 public membershipWeight;

    uint256 private constant BASE_DIVIDER = 16000;

    mapping(address => bool) public isPalUserToken;

    event SetProtocolFeeDestination(address indexed destination);
    event SetProtocolFeePercent(uint256 percent);
    event SetTokenOwnerFeePercent(uint256 percent);
    event SetMembershipToken(address indexed token);
    event SetMembershipWeight(uint256 weight);

    event UserTokenCreated(address indexed owner, address indexed tokenAddress, string name, string symbol);
    event Trade(
        address indexed trader,
        address indexed tokenAddress,
        bool indexed isBuy,
        uint256 amount,
        uint256 price,
        uint256 protocolFee,
        uint256 tokenOwnerFee,
        uint256 supply
    );

    function initialize(
        address payable _protocolFeeDestination,
        uint256 _protocolFeePercent,
        uint256 _tokenOwnerFeePercent
    ) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        protocolFeeDestination = _protocolFeeDestination;
        protocolFeePercent = _protocolFeePercent;
        tokenOwnerFeePercent = _tokenOwnerFeePercent;

        emit SetProtocolFeeDestination(_protocolFeeDestination);
        emit SetProtocolFeePercent(_protocolFeePercent);
        emit SetTokenOwnerFeePercent(_tokenOwnerFeePercent);
    }

    function setProtocolFeeDestination(address payable _feeDestination) public onlyOwner {
        protocolFeeDestination = _feeDestination;
        emit SetProtocolFeeDestination(_feeDestination);
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwner {
        protocolFeePercent = _feePercent;
        emit SetProtocolFeePercent(_feePercent);
    }

    function setTokenOwnerFeePercent(uint256 _feePercent) public onlyOwner {
        tokenOwnerFeePercent = _feePercent;
        emit SetTokenOwnerFeePercent(_feePercent);
    }

    function setMembershipToken(address _token) public onlyOwner {
        membershipToken = IERC20(_token);
        emit SetMembershipToken(_token);
    }

    function setMembershipWeight(uint256 _weight) public onlyOwner {
        require(_weight <= protocolFeePercent, "Weight cannot exceed protocol fee percent");
        membershipWeight = _weight;
        emit SetMembershipWeight(_weight);
    }

    function calculateAdditionalTokenOwnerFee(uint256 price, address tokenOwner) public view returns (uint256) {
        if (address(membershipToken) == address(0)) {
            return 0;
        }

        uint256 memberBalance = membershipToken.balanceOf(tokenOwner);
        uint256 feeIncrease = (((price * membershipWeight) / 1 ether) * memberBalance) / 1 ether;
        uint256 maxAdditionalFee = (price * protocolFeePercent) / 1 ether;

        return feeIncrease < maxAdditionalFee ? feeIncrease : maxAdditionalFee;
    }

    // Users can create their own tokens using this function
    function createToken(string memory name, string memory symbol) public returns (address) {
        PalUserToken newToken = new PalUserToken(msg.sender, name, symbol);

        isPalUserToken[address(newToken)] = true;

        emit UserTokenCreated(msg.sender, address(newToken), name, symbol);
        return address(newToken);
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 sum1 = ((((supply * (supply + 1 ether)) / 1 ether) * (2 * supply + 1 ether)) / 1 ether) / 6;
        uint256 sum2 = (((((supply + amount) * (supply + 1 ether + amount)) / 1 ether) *
            (2 * (supply + amount) + 1 ether)) / 1 ether) / 6;
        uint256 summation = sum2 - sum1;
        return summation / BASE_DIVIDER;
    }

    function getBuyPrice(address tokenAddress, uint256 amount) public view returns (uint256) {
        PalUserToken token = PalUserToken(tokenAddress);
        return getPrice(token.totalSupply(), amount);
    }

    function getSellPrice(address tokenAddress, uint256 amount) public view returns (uint256) {
        PalUserToken token = PalUserToken(tokenAddress);
        return getPrice(token.totalSupply() - amount, amount);
    }

    function getBuyPriceAfterFee(address tokenAddress, uint256 amount) external view returns (uint256) {
        uint256 price = getBuyPrice(tokenAddress, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether;
        return price + protocolFee + tokenOwnerFee;
    }

    function getSellPriceAfterFee(address tokenAddress, uint256 amount) external view returns (uint256) {
        uint256 price = getSellPrice(tokenAddress, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether;
        return price - protocolFee - tokenOwnerFee;
    }

    function executeTrade(address tokenAddress, uint256 amount, uint256 price, bool isBuy) private nonReentrant {
        require(isPalUserToken[tokenAddress], "Invalid token address");

        PalUserToken token = PalUserToken(tokenAddress);
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether;
        uint256 additionalFee = calculateAdditionalTokenOwnerFee(price, token.owner());
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether - additionalFee;

        if (isBuy) {
            require(msg.value >= price + protocolFee + tokenOwnerFee + additionalFee, "Insufficient payment");
            token.mint(msg.sender, amount);
            protocolFeeDestination.sendValue(protocolFee);
            payable(token.owner()).sendValue(tokenOwnerFee + additionalFee);
            if (msg.value > price + protocolFee + tokenOwnerFee + additionalFee) {
                uint256 refund = msg.value - price - protocolFee - tokenOwnerFee - additionalFee;
                payable(msg.sender).sendValue(refund);
            }
        } else {
            require(token.balanceOf(msg.sender) >= amount, "Insufficient tokens");
            token.burn(msg.sender, amount);
            uint256 netAmount = price - protocolFee - tokenOwnerFee - additionalFee;
            payable(msg.sender).sendValue(netAmount);
            protocolFeeDestination.sendValue(protocolFee);
            payable(token.owner()).sendValue(tokenOwnerFee + additionalFee);
        }

        emit Trade(
            msg.sender,
            tokenAddress,
            isBuy,
            amount,
            price,
            protocolFee,
            tokenOwnerFee + additionalFee,
            token.totalSupply()
        );
    }

    function buyToken(address tokenAddress, uint256 amount) external payable {
        uint256 price = getBuyPrice(tokenAddress, amount);
        executeTrade(tokenAddress, amount, price, true);
    }

    function sellToken(address tokenAddress, uint256 amount) external {
        uint256 price = getSellPrice(tokenAddress, amount);
        executeTrade(tokenAddress, amount, price, false);
    }
}
