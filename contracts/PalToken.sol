// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PalToken is ERC20Permit, Ownable {
    address public _pal;
    address public _pendingOwner;
    string private _name;
    string private _symbol;

    event OwnershipTransferProposed(address indexed previousOwner, address indexed newOwner);
    event SetName(string name);
    event SetSymbol(string symbol);

    constructor(address owner_, string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        _pal = msg.sender;
        _name = name_;
        _symbol = symbol_;
        _transferOwnership(owner_);
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        require(newOwner != address(0), "PalToken: new owner is the zero address");
        emit OwnershipTransferProposed(owner(), newOwner);
        _pendingOwner = newOwner;
    }

    function acceptOwnership() external {
        require(msg.sender == _pendingOwner, "PalToken: caller is not the pending owner");
        _transferOwnership(_pendingOwner);
        _pendingOwner = address(0);
    }

    function setName(string memory name_) external onlyOwner {
        _name = name_;
        emit SetName(name_);
    }

    function setSymbol(string memory symbol_) external onlyOwner {
        _symbol = symbol_;
        emit SetSymbol(symbol_);
    }

    modifier onlyPal() {
        require(msg.sender == _pal, "PalToken: caller is not the pal");
        _;
    }

    function mint(address to, uint256 amount) external onlyPal {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyPal {
        _burn(from, amount);
    }
}
