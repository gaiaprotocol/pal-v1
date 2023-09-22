// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Pal.sol";

contract PalTokenPriceAggregator {
    Pal public immutable pal;

    constructor(Pal _pal) {
        pal = _pal;
    }

    function getBulkTokenPrices(address[] memory _tokens) external view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](_tokens.length);
        for (uint256 i = 0; i < _tokens.length; i++) {
            prices[i] = pal.getBuyPrice(_tokens[i], 1 ether);
        }
        return prices;
    }
}
