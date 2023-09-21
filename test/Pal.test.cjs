const { ethers } = require("hardhat");
const { expect } = require("chai");
const random = require("random-bigint");

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

describe("Pal Contract", () => {
  let Pal, PalUserToken, ERC20, pal, userToken, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the Pal contract
    Pal = await ethers.getContractFactory("Pal");
    pal = await Pal.deploy();

    // Initialize Pal contract
    await pal.initialize(
      addr1,
      BigInt("50000000000000000"),
      BigInt("50000000000000000"),
    ); // Replace these parameters with your own values

    PalUserToken = await ethers.getContractFactory("PalUserToken");
    ERC20 = await ethers.getContractFactory("ERC20Mock");
  });

  it("price test", async () => {
    const supply = 0n;
    const amount = 1n;
    const price = getPrice(supply + 1n, amount);
    const palPrice = await pal.getPrice(
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
      const palPrice = await pal.getPrice(
        supply * ethers.parseEther("1"),
        amount * ethers.parseEther("1"),
      );
      /*console.log(
        `supply: ${supply}, amount: ${amount}, price: ${price}, palPrice: ${palPrice}`,
      );*/
      expect(palPrice).to.equal(price);
    }

    const palPrice2 = await pal.getPrice(
      ethers.parseEther("0.0000001"),
      ethers.parseEther("0.0000001"),
    );
    console.log(ethers.formatEther(palPrice2));

    let test = 0n;
    for (let i = 0; i < 100; i++) {
      test += await pal.getPrice(
        ethers.parseEther(i.toString()),
        ethers.parseEther("1"),
      );
    }
    expect(test).to.equal(
      await pal.getPrice(
        0n,
        ethers.parseEther("100"),
      ),
    );
  });

  describe("Token Creation", function () {
    it("Should create a new user token", async function () {
      const tx = await (await pal.connect(addr1).createToken(
        "UserToken",
        "UTK",
      )).wait();
      const userTokenAddress = tx.logs[2].args[1];
      expect(await pal.isPalUserToken(userTokenAddress)).to.equal(true);
    });
  });

  describe("Buy and Sell", function () {
    it("Should buy a token", async function () {
      const tx = await (await pal.connect(addr1).createToken(
        "UserToken",
        "UTK",
      )).wait();
      const userTokenAddress = tx.logs[2].args[1];

      const tx2 = await (await pal.connect(addr1).buyToken(
        userTokenAddress,
        ethers.parseEther("100"),
        {
          value: await pal.getBuyPriceAfterFee(
            userTokenAddress,
            ethers.parseEther("100"),
          ),
        },
      )).wait();

      const userToken = PalUserToken.attach(userTokenAddress);
      expect(await userToken.balanceOf(addr1)).to.equal(
        ethers.parseEther("100"),
      );
    });

    it("Should sell a token", async function () {
      const tx = await (await pal.connect(addr1).createToken(
        "UserToken",
        "UTK",
      )).wait();
      const userTokenAddress = tx.logs[2].args[1];
      await pal.connect(addr1).buyToken(
        userTokenAddress,
        ethers.parseEther("100"),
        {
          value: await pal.getBuyPriceAfterFee(
            userTokenAddress,
            ethers.parseEther("100"),
          ),
        },
      );
      await pal.connect(addr1).sellToken(
        userTokenAddress,
        ethers.parseEther("50"),
      );
      const userToken = PalUserToken.attach(userTokenAddress);
      expect(await userToken.balanceOf(addr1)).to.equal(
        ethers.parseEther("50"),
      );
    });
  });

  describe("Fees", function () {
    it("Should correctly calculate protocol fee", async function () {
      const tx = await (await pal.connect(addr1).createToken(
        "UserToken",
        "UTK",
      )).wait();
      const userTokenAddress = tx.logs[2].args[1];

      const tx2 = await (await pal.connect(addr1).buyToken(
        userTokenAddress,
        ethers.parseEther("100"),
        {
          value: await pal.getBuyPriceAfterFee(
            userTokenAddress,
            ethers.parseEther("100"),
          ),
        },
      )).wait();
      console.log(tx2.logs[1].args[6], tx2.logs[1].args[6] + tx2.logs[1].args[6] / 10n);

      const userToken = PalUserToken.attach(userTokenAddress);
      expect(await userToken.balanceOf(addr1)).to.equal(
        ethers.parseEther("100"),
      );

      await pal.connect(addr1).sellToken(
        userTokenAddress,
        ethers.parseEther("100"),
      );

      const membershipToken = await ERC20.deploy(
        "Membership Token",
        "MTK",
        ethers.parseEther("100000000"),
      );
      await membershipToken.transfer(addr1.address, ethers.parseEther("10000"));
      await pal.setMembershipToken(membershipToken.target);
      await pal.setMembershipWeight(ethers.parseEther("0.0000005"));

      const tx3 = await (await pal.connect(addr1).buyToken(
        userTokenAddress,
        ethers.parseEther("100"),
        {
          value: await pal.getBuyPriceAfterFee(
            userTokenAddress,
            ethers.parseEther("100"),
          ),
        },
      )).wait();
      console.log(tx3.logs[1].args[6]);
    });
  });
});
