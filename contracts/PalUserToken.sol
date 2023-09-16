// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract PalUserToken is ERC20Permit, Ownable2Step {
    address public immutable _pal;
    string private _name;
    string private _symbol;

    event SetName(string name);
    event SetSymbol(string symbol);

    constructor(
        address owner_,
        string memory name_,
        string memory symbol_
    ) ERC20Permit("Pal User Token") ERC20(name_, symbol_) {
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
