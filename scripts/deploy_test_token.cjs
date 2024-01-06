require("dotenv/config");
require("@nomiclabs/hardhat-ethers");

async function main() {
  const Pal = await ethers.getContractFactory("Pal");
  const pal = Pal.attach(process.env.PAL_ADDRESS);

  await pal.createToken("Test Token", "TEST");

  process.exit();
}

main();
