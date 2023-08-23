// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PalToken.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Pal is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    address payable public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public tokenOwnerFeePercent;
    uint256 private constant BASE_DIVIDER = 16000;

    mapping(address => bool) public isPalToken;

    event TokenCreated(address indexed owner, address tokenAddress, string name, string symbol);
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
    }

    function setProtocolFeeDestination(address payable _feeDestination) public onlyOwner {
        protocolFeeDestination = _feeDestination;
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwner {
        protocolFeePercent = _feePercent;
    }

    function setTokenOwnerFeePercent(uint256 _feePercent) public onlyOwner {
        tokenOwnerFeePercent = _feePercent;
    }

    // Users can create their own tokens using this function
    function createToken(string memory name, string memory symbol) public returns (address) {
        PalToken newToken = new PalToken(msg.sender, name, symbol);

        isPalToken[address(newToken)] = true;
        newToken.mint(msg.sender, 1 ether);

        emit TokenCreated(msg.sender, address(newToken), name, symbol);
        return address(newToken);
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 sum1 = supply == 0
            ? 0
            : (((((supply - 1 ether) * supply) / 1 ether) * (2 * (supply - 1 ether) + 1 ether)) / 1 ether) / 6;
        uint256 sum2 = (supply == 0 && amount == 1 ether)
            ? 0
            : (((((supply - 1 ether + amount) * (supply + amount)) / 1 ether) *
                (2 * (supply - 1 ether + amount) + 1 ether)) / 1 ether) / 6;
        uint256 summation = sum2 - sum1;
        return summation / BASE_DIVIDER;
    }

    function getBuyPrice(address tokenAddress, uint256 amount) public view returns (uint256) {
        PalToken token = PalToken(tokenAddress);
        return getPrice(token.totalSupply(), amount);
    }

    function getSellPrice(address tokenAddress, uint256 amount) public view returns (uint256) {
        PalToken token = PalToken(tokenAddress);
        return getPrice(token.totalSupply() - amount, amount);
    }

    function getBuyPriceAfterFee(address tokenAddress, uint256 amount) public view returns (uint256) {
        uint256 price = getBuyPrice(tokenAddress, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether;
        return price + protocolFee + tokenOwnerFee;
    }

    function getSellPriceAfterFee(address tokenAddress, uint256 amount) public view returns (uint256) {
        uint256 price = getSellPrice(tokenAddress, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether;
        return price - protocolFee - tokenOwnerFee;
    }

    function executeTrade(address tokenAddress, uint256 amount, uint256 price, bool isBuy) internal nonReentrant {
        require(isPalToken[tokenAddress], "Invalid token address");

        PalToken token = PalToken(tokenAddress);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether;

        if (isBuy) {
            require(msg.value >= price + protocolFee + tokenOwnerFee, "Insufficient payment");
            token.mint(msg.sender, amount);
            protocolFeeDestination.transfer(protocolFee);
            payable(token.owner()).transfer(tokenOwnerFee);
            if (msg.value > price + protocolFee + tokenOwnerFee) {
                uint256 refund = msg.value - price - protocolFee - tokenOwnerFee;
                payable(msg.sender).transfer(refund);
            }
        } else {
            require(token.balanceOf(msg.sender) >= amount, "Insufficient tokens");
            token.burn(msg.sender, amount);
            uint256 netAmount = price - protocolFee - tokenOwnerFee;
            payable(msg.sender).transfer(netAmount);
            protocolFeeDestination.transfer(protocolFee);
            payable(token.owner()).transfer(tokenOwnerFee);
        }

        emit Trade(msg.sender, tokenAddress, isBuy, amount, price, protocolFee, tokenOwnerFee, token.totalSupply());
    }

    function buyToken(address tokenAddress, uint256 amount) public payable {
        uint256 price = getBuyPrice(tokenAddress, amount);
        executeTrade(tokenAddress, amount, price, true);
    }

    function sellToken(address tokenAddress, uint256 amount) public {
        uint256 price = getSellPrice(tokenAddress, amount);
        executeTrade(tokenAddress, amount, price, false);
    }

    // Fallback function
    receive() external payable {
        revert("Direct ether transfers are not allowed");
    }
}
