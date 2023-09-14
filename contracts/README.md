# Documentation for Pal and PalToken Smart Contracts

## Overview
The `Pal` and `PalToken` smart contracts are designed to facilitate the creation and trading of ERC20 tokens on the Ethereum blockchain. The contracts leverage OpenZeppelin libraries for added security and functionality.

### Pal
The primary contract, `Pal`, allows users to create their own ERC20 tokens with custom names and symbols. It also provides a mechanism for buying and selling these tokens based on a pricing formula.

#### Base
- [0x6C4F9e887304eFF6b819787F44545d947118884b](https://basescan.org/address/0x6C4F9e887304eFF6b819787F44545d947118884b)

### PalToken
This is the ERC20 token structure that gets generated when users decide to create their tokens. It includes standard ERC20 functionalities, along with additional methods for setting the token's name and symbol post-creation.

## Key Functions

### PalToken

- **constructor(address owner, string memory name_, string memory symbol_)**: Initializes the token with an owner, name, and symbol.
  
- **setName(string memory name_)**: Sets a new name for the token. Can only be called by the token's owner.

- **setSymbol(string memory symbol_)**: Sets a new symbol for the token. Can only be called by the token's owner.

- **mint(address to, uint256 amount)**: Mints new tokens. Can only be called by the "pal" (typically the contract deployer).

- **burn(address from, uint256 amount)**: Burns tokens from a given address. Can only be called by the "pal".

### Pal

- **initialize(...)**: Initializes contract with protocol fee details.

- **createToken(string memory name, string memory symbol)**: Allows users to create a new ERC20 token with the specified name and symbol.

- **getBuyPrice(address tokenAddress, uint256 amount)**: Calculates the buy price for a given token and amount using a predefined formula.

- **getSellPrice(address tokenAddress, uint256 amount)**: Calculates the sell price for a given token and amount using a predefined formula.

- **buyToken(address tokenAddress, uint256 amount)**: Allows users to buy a specified amount of a token.

- **sellToken(address tokenAddress, uint256 amount)**: Allows users to sell a specified amount of a token.

## Pricing Mechanism

The pricing mechanism is derived from a mathematical formula based on token supply and the amount being transacted. It calculates the integral of a curve to derive the token's price.

## Fees

Both protocol fees and token owner fees are deducted during transactions. The fee percentages and destinations can be adjusted by the contract owner.

## Security

The contracts employ several security practices, including:

1. Using `ReentrancyGuard` to prevent reentrancy attacks.
2. Leveraging OpenZeppelin's secure and tested libraries.
3. Providing descriptive error messages for better debugging and user experience.
4. Allowing upgradability for the Pal contract to accommodate future improvements.

## Recommendations

1. Users should understand the pricing formula and fee structure before engaging in transactions.
2. Token creators should use the `setName` and `setSymbol` functionalities judiciously to avoid confusion among users.
