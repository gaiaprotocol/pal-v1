import "dotenv/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-solhint";
import "solidity-coverage";
// import "hardhat-gas-reporter";
import "hardhat-tracer";

let accounts;
if (process.env.PRIVATE_KEY) {
    accounts = [process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"];
} else {
    accounts = {
        mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
    };
}

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        mainnet: {
            url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts,
            chainId: 1,
        },
        polygon: {
            url: `https://polygon-rpc.com/`,
            accounts,
            chainId: 137,
        },
        klaytn: {
            url: "https://public-node-api.klaytnapi.com/v1/cypress",
            accounts,
            chainId: 8217,
            gasPrice: 250000000000,
        },
        bnb: {
            url: `https://bsc-dataseed.binance.org/`,
            accounts,
            chainId: 56,
        },
        goerli: {
            url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts,
            chainId: 5,
        },
        mumbai: {
            url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts,
            chainId: 80001,
        },
        baobab: {
            url: "https://public-node-api.klaytnapi.com/v1/baobab",
            accounts,
            chainId: 1001,
        },
        popcateum: {
            url: "https://dataseed.popcateum.org",
            accounts,
            chainId: 1213,
        },
        bifrost: {
            url: "https://public-01.mainnet.thebifrost.io/rpc",
            accounts,
            chainId: 3068,
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    mocha: {
        timeout: 600000,
    },
};

export default config;
