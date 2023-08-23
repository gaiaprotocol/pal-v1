// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PalToken is ERC20, Ownable {
    address public _pal;
    string private _name;
    string private _symbol;

    event SetNameAndSymbol(string name, string symbol);

    constructor(address owner_, string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        _pal = msg.sender;
        _name = name_;
        _symbol = symbol_;
        transferOwnership(owner_);
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function setNameAndSymbol(string memory name_, string memory symbol_) external onlyOwner {
        _name = name_;
        _symbol = symbol_;
        emit SetNameAndSymbol(name_, symbol_);
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
