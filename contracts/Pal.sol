// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PalToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Pal is Ownable {
    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public tokenOwnerFeePercent;

    event TokenCreated(address indexed owner, address tokenAddress, string name, string symbol);
    event BuyToken(
        address indexed buyer,
        address indexed tokenAddress,
        uint256 amount,
        uint256 price,
        uint256 protocolFee,
        uint256 tokenOwnerFee,
        uint256 supply
    );
    event SellToken(
        address indexed seller,
        address indexed tokenAddress,
        uint256 amount,
        uint256 price,
        uint256 protocolFee,
        uint256 tokenOwnerFee,
        uint256 supply
    );

    function setProtocolFeeDestination(address _feeDestination) public onlyOwner {
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
        emit TokenCreated(msg.sender, address(newToken), name, symbol);
        return address(newToken);
    }

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
        return (summation * 1 ether) / 16000;
    }

    function getBuyPrice(address tokenAddress, uint256 amount) public view returns (uint256) {
        PalToken token = PalToken(tokenAddress);
        return getTokenPrice(token.totalSupply(), amount, token.decimals());
    }

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

    function buyToken(address tokenAddress, uint256 amount) public payable {
        PalToken token = PalToken(tokenAddress);
        uint256 supply = token.totalSupply();
        address tokenOwner = token.owner();
        require(supply > 0 || tokenAddress == msg.sender, "Only the token's creator can buy the first token");

        uint256 price = getTokenPrice(supply, amount, token.decimals());
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether;
        require(msg.value >= price + protocolFee + tokenOwnerFee, "Insufficient payment");

        token.mint(msg.sender, amount);
        emit BuyToken(msg.sender, tokenAddress, amount, price, protocolFee, tokenOwnerFee, supply + amount);

        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = tokenOwner.call{value: tokenOwnerFee}("");
        require(success1 && success2, "Unable to send funds");
    }

    function sellToken(address tokenAddress, uint256 amount) public {
        PalToken token = PalToken(tokenAddress);
        uint256 supply = token.totalSupply();
        address tokenOwner = token.owner();
        require(supply > amount, "Cannot sell the last token");

        uint256 price = getTokenPrice(supply - amount, amount, token.decimals()); // Referencing for simplicity
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether;
        require(token.balanceOf(msg.sender) >= amount, "Insufficient tokens");

        token.burn(msg.sender, amount);
        emit SellToken(msg.sender, tokenAddress, amount, price, protocolFee, tokenOwnerFee, supply - amount);

        (bool success1, ) = msg.sender.call{value: price - protocolFee - tokenOwnerFee}("");
        (bool success2, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success3, ) = tokenOwner.call{value: tokenOwnerFee}("");
        require(success1 && success2 && success3, "Unable to send funds");
    }
}
