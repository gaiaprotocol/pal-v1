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
    address[] public createdTokens;

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

        createdTokens.push(address(newToken));
        newToken.mint(msg.sender, 1 ether);

        emit TokenCreated(msg.sender, address(newToken), name, symbol);
        return address(newToken);
    }

    // The calculateFee function computes the fee based on a given price and a fee percentage.
    function calculateFee(uint256 price, uint256 feePercent) public pure returns (uint256) {
        return (price * feePercent) / 1 ether;
    }

    // The getTokenPrice function calculates the token price based on the current supply, transaction volume, and the number of decimals.
    // This function uses the Riemann Sum approach to determine the price.
    // It essentially performs an integration calculation on how the price changes based on the given supply and volume.
    function getTokenPrice(uint256 supply, uint256 amount, uint8 decimals) public pure returns (uint256) {
        uint256 base = 10 ** decimals;
        uint256 normalizedSupply = supply / base;
        uint256 normalizedAmount = amount / base;

        uint256 sum1 = normalizedSupply == 0
            ? 0
            : ((normalizedSupply - 1) * normalizedSupply * (2 * (normalizedSupply - 1) + 1)) / 6;
        uint256 sum2 = (normalizedSupply == 0 && normalizedAmount == 1)
            ? 0
            : ((normalizedSupply - 1 + normalizedAmount) *
                (normalizedSupply + normalizedAmount) *
                (2 * (normalizedSupply - 1 + normalizedAmount) + 1)) / 6;

        uint256 summation = sum2 - sum1;
        return (summation * 1 ether) / BASE_DIVIDER;
    }

    // The getBuyPrice function calculates the buying price based on a given token address and the amount of tokens to purchase.
    function getBuyPrice(address tokenAddress, uint256 amount) public view returns (uint256) {
        PalToken token = PalToken(tokenAddress);
        return getTokenPrice(token.totalSupply(), amount, token.decimals());
    }

    // The getSellPrice function calculates the selling price based on a given token address and the amount of tokens to sell.
    function getSellPrice(address tokenAddress, uint256 amount) public view returns (uint256) {
        PalToken token = PalToken(tokenAddress);
        return getTokenPrice(token.totalSupply() - amount, amount, token.decimals());
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
        PalToken token = PalToken(tokenAddress);
        uint256 protocolFee = calculateFee(price, protocolFeePercent);
        uint256 tokenOwnerFee = calculateFee(price, tokenOwnerFeePercent);

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
}
