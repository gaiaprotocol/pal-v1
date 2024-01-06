// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PalUserToken.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract Pal is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using AddressUpgradeable for address payable;
    using ECDSAUpgradeable for bytes32;

    address payable public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public tokenOwnerFeePercent;

    IERC20 public membershipToken; // deprecated
    uint256 public membershipWeight; // deprecated

    uint256 private constant BASE_DIVIDER = 16000;

    mapping(address => bool) public isPalUserToken;

    address public oracleAddress;

    event SetProtocolFeeDestination(address indexed destination);
    event SetProtocolFeePercent(uint256 percent);
    event SetTokenOwnerFeePercent(uint256 percent);
    event SetOracleAddress(address indexed oracle);

    event UserTokenCreated(address indexed owner, address indexed tokenAddress, string name, string symbol);
    event Trade(
        address indexed trader,
        address indexed tokenAddress,
        bool indexed isBuy,
        uint256 amount,
        uint256 price,
        uint256 protocolFee,
        uint256 tokenOwnerFee,
        uint256 additionalFee,
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

    function setOracleAddress(address _oracle) public onlyOwner {
        oracleAddress = _oracle;
        emit SetOracleAddress(_oracle);
    }

    function splitSignatureData(bytes memory signature) internal pure returns (uint256 feeRatio, bytes32 originalHash) {
        require(signature.length == 96, "Pal: Invalid signature length");

        // Split the signature into two parts: the feeRatio and the original signed hash
        bytes32 feeRatioBytes;
        assembly {
            feeRatioBytes := mload(add(signature, 32))
            originalHash := mload(add(signature, 64))
        }

        feeRatio = uint256(feeRatioBytes);
        require(feeRatio <= 1 ether, "Pal: Fee ratio out of bounds");
        return (feeRatio, originalHash);
    }

    function calculateAdditionalTokenOwnerFee(
        uint256 price,
        bytes memory oracleSignature
    ) public view returns (uint256) {
        // Extract the fee ratio from the oracle's signed message
        (uint256 feeRatio, bytes32 originalHash) = splitSignatureData(oracleSignature);
        bytes32 hash = keccak256(abi.encodePacked(price, feeRatio)).toEthSignedMessageHash();

        require(originalHash == hash, "Pal: Invalid data provided");
        address signer = hash.recover(oracleSignature);
        require(signer == oracleAddress, "Pal: Invalid oracle signature");

        return (price * feeRatio) / 1 ether;
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

    function executeTrade(
        address tokenAddress,
        uint256 amount,
        uint256 price,
        bool isBuy,
        bytes memory oracleSignature
    ) private nonReentrant {
        require(isPalUserToken[tokenAddress], "Pal: Invalid token address");

        PalUserToken token = PalUserToken(tokenAddress);
        uint256 additionalFee = calculateAdditionalTokenOwnerFee(price, oracleSignature);
        uint256 tokenOwnerFee = (price * tokenOwnerFeePercent) / 1 ether + additionalFee;
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether - additionalFee;

        if (isBuy) {
            require(msg.value >= price + protocolFee + tokenOwnerFee, "Pal: Insufficient payment");
            token.mint(msg.sender, amount);
            protocolFeeDestination.sendValue(protocolFee);
            payable(token.owner()).sendValue(tokenOwnerFee);
            if (msg.value > price + protocolFee + tokenOwnerFee) {
                uint256 refund = msg.value - price - protocolFee - tokenOwnerFee;
                payable(msg.sender).sendValue(refund);
            }
        } else {
            require(token.balanceOf(msg.sender) >= amount, "Pal: Insufficient tokens");
            token.burn(msg.sender, amount);
            uint256 netAmount = price - protocolFee - tokenOwnerFee;
            payable(msg.sender).sendValue(netAmount);
            protocolFeeDestination.sendValue(protocolFee);
            payable(token.owner()).sendValue(tokenOwnerFee);
        }

        emit Trade(
            msg.sender,
            tokenAddress,
            isBuy,
            amount,
            price,
            protocolFee,
            tokenOwnerFee,
            additionalFee,
            token.totalSupply()
        );
    }

    function buyToken(address tokenAddress, uint256 amount, bytes memory oracleSignature) external payable {
        uint256 price = getBuyPrice(tokenAddress, amount);
        executeTrade(tokenAddress, amount, price, true, oracleSignature);
    }

    function sellToken(address tokenAddress, uint256 amount, bytes memory oracleSignature) external {
        uint256 price = getSellPrice(tokenAddress, amount);
        executeTrade(tokenAddress, amount, price, false, oracleSignature);
    }
}
