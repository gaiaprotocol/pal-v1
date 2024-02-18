require("@nomiclabs/hardhat-ethers");

async function main() {
  const deployedProxyAddress = process.env.PAL_ADDRESS_BASE_SEPOLIA;

  const PalUpgrade = await ethers.getContractFactory(
    "PalOnBase",
  );
  console.log("Upgrading Pal...");

  await upgrades.upgradeProxy(deployedProxyAddress, PalUpgrade);
  console.log("Pal upgraded");

  process.exit();
}

main();
