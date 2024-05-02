require("@nomiclabs/hardhat-ethers");

async function main() {
  const deployedProxyAddress = process.env.PAL_ADDRESS_BASE;

  const PalUpgrade = await ethers.getContractFactory(
    "Pal",
  );
  const contract = await PalUpgrade.attach(deployedProxyAddress);

  const tx = await contract.transferOwnership("0x48674148a4043EAadB92E5D8D7C493121D6489b1");
  await tx.wait();

  console.log("Done", await contract.owner());

  process.exit();
}

main();
