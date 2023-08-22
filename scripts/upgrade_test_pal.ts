import { ethers, upgrades } from "hardhat";

async function main() {
  const deployedProxyAddress = process.env.PAL_ADDRESS!;

  const TestPalUpgrade = await ethers.getContractFactory(
    //"TestPalUpgrade",
    "Pal",
  );
  console.log("Upgrading Pal...");

  await upgrades.upgradeProxy(deployedProxyAddress, TestPalUpgrade);
  console.log("Pal upgraded");
}

main();
