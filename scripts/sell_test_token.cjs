require("dotenv/config");
require("@nomiclabs/hardhat-ethers");

async function main() {
  const Pal = await ethers.getContractFactory("Pal");
  const pal = Pal.attach(process.env.PAL_ADDRESS);

  const price = await pal.getSellPriceAfterFee(
    "0x7E26F602D8D023eDdED7E73Bb81c90Bc24590321",
    ethers.parseEther("1"),
  );
  console.log(ethers.formatEther(price));

  await pal.sellToken(
    "0x7E26F602D8D023eDdED7E73Bb81c90Bc24590321",
    ethers.parseEther("1"),
  );
}

main();
