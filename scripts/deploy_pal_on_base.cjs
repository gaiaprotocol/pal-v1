require("@nomiclabs/hardhat-ethers");

async function main() {
  const Pal = await ethers.getContractFactory("PalOnBase");
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

  console.log("Pal deployed to:", pal.target);
  process.exit();
}

main();
