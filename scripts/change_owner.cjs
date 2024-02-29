require("@nomiclabs/hardhat-ethers");

async function main() {
  const deployedProxyAddress = process.env.PAL_ADDRESS_BASE;

  const PalUpgrade = await ethers.getContractFactory(
    "Pal",
  );
  const contract = await PalUpgrade.attach(deployedProxyAddress);

  const tx = await contract.transferOwnership("0x8033cEB86c71EbBF575fF7015FcB8F1689d90aC1");
  await tx.wait();

  console.log("Done", await contract.owner());

  process.exit();
}

main();
