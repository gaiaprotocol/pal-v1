import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  const Pal = await ethers.getContractFactory("Pal");
  const pal = Pal.attach(process.env.PAL_ADDRESS!);

  const price = await pal.getSellPriceAfterFee(
    "0xf05114bed05358c0d3a3da0d75da94d3c77701d5",
    ethers.parseEther("1"),
  );
  console.log(ethers.formatEther(price));

  await pal.sellToken(
    "0xf05114bed05358c0d3a3da0d75da94d3c77701d5",
    ethers.parseEther("1"),
  );
}

main();
