const { ethers } = require("hardhat");
const { expect } = require("chai");
const random = require("random-bigint");

let Pal;

function getPrice(supply, amount) {
  const sum1 = supply == 0n
    ? 0n
    : (supply - 1n) * (supply) * (2n * (supply - 1n) + 1n) / 6n;
  const sum2 = supply == 0n && amount == 1n
    ? 0n
    : (supply - 1n + amount) * (supply + amount) *
      (2n * (supply - 1n + amount) + 1n) / 6n;
  const summation = sum2 - sum1;
  return summation * ethers.parseEther("1") / 16000n;
}

describe("Pal", () => {
  beforeEach(async () => {
    Pal = await (await ethers.getContractFactory("Pal")).deploy();
  });

  it("price test", async () => {
    const supply = 0n;
    const amount = 1n;
    const price = getPrice(supply + 1n, amount);
    const palPrice = await Pal.getPrice(
      supply * ethers.parseEther("1"),
      amount * ethers.parseEther("1"),
    );
    /*console.log(
      `supply: ${supply}, amount: ${amount}, price: ${price}, palPrice: ${palPrice}`,
    );*/
    expect(palPrice).to.equal(price);

    for (let i = 0; i < 100; i++) {
      const supply = random(32);
      const amount = random(32);
      const price = getPrice(supply + 1n, amount);
      const palPrice = await Pal.getPrice(
        supply * ethers.parseEther("1"),
        amount * ethers.parseEther("1"),
      );
      /*console.log(
        `supply: ${supply}, amount: ${amount}, price: ${price}, palPrice: ${palPrice}`,
      );*/
      expect(palPrice).to.equal(price);
    }

    const palPrice2 = await Pal.getPrice(
      ethers.parseEther("0.0000001"),
      ethers.parseEther("0.0000001"),
    );
    console.log(ethers.formatEther(palPrice2));

    let test = 0n;
    for (let i = 0; i < 100; i++) {
      test += await Pal.getPrice(
        ethers.parseEther(i.toString()),
        ethers.parseEther("1"),
      );
    }
    expect(test).to.equal(
      await Pal.getPrice(
        0n,
        ethers.parseEther("100"),
      ),
    );
  });
});
