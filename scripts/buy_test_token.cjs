require("dotenv/config");
require("@nomiclabs/hardhat-ethers")

async function main() {
  const Pal = await ethers.getContractFactory("Pal");
  const pal = Pal.attach(process.env.PAL_ADDRESS);

  const price = await pal.getBuyPriceAfterFee(
    "0x7E26F602D8D023eDdED7E73Bb81c90Bc24590321",
    ethers.parseEther("1"),
  );
  console.log(ethers.formatEther(price));

  await pal.buyToken(
    "0x7E26F602D8D023eDdED7E73Bb81c90Bc24590321",
    ethers.parseEther("1"),
    { value: price },
  );
}

main();
