require("dotenv/config");
require("@nomiclabs/hardhat-ethers");

async function main() {
  const PalTokenPriceAggregator = await ethers.getContractFactory("PalTokenPriceAggregator");
  console.log("Deploying PalTokenPriceAggregator to ", network.name);

  const aggregator = await PalTokenPriceAggregator.deploy(process.env.PAL_ADDRESS);
  await aggregator.waitForDeployment();

  console.log("PalTokenPriceAggregator deployed to:", aggregator.target);
}

main();
