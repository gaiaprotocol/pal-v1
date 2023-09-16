require("@nomiclabs/hardhat-ethers");

async function main() {
  const deployedProxyAddress = process.env.PAL_ADDRESS;

  const PalUpgrade = await ethers.getContractFactory(
    "Pal",
  );
  console.log("Upgrading Pal...");

  await upgrades.upgradeProxy(deployedProxyAddress, PalUpgrade, { nonce: 11 });
  console.log("Pal upgraded");
}

main();
