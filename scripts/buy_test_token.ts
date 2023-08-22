import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  const Pal = await ethers.getContractFactory("Pal");
  const pal = Pal.attach(process.env.PAL_ADDRESS!);

  const price = await pal.getBuyPriceAfterFee(
    "0xf05114bed05358c0d3a3da0d75da94d3c77701d5",
    ethers.parseEther("5"),
  );
  console.log(ethers.formatEther(price));

  await pal.buyToken(
    "0xf05114bed05358c0d3a3da0d75da94d3c77701d5",
    ethers.parseEther("5"),
    { value: price },
  );
}

main();
