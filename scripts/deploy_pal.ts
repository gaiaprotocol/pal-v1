import { ethers, network, upgrades } from "hardhat";

async function main() {
  const Pal = await ethers.getContractFactory("Pal");
  console.log("Deploying Pal to ", network.name);

  const [account1] = await ethers.getSigners();

  const pal = await upgrades.deployProxy(
    Pal,
    [
      account1.address,
      BigInt("50000000000000000"),
      BigInt("50000000000000000"),
    ],
    {
      initializer: "initialize",
    },
  );
  await pal.waitForDeployment();

  console.log("PriceFeedTracker deployed to:", pal.address);
}

main();
