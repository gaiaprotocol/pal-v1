const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("PalUserToken Contract", () => {
  let PalUserToken;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    PalUserToken = await (await ethers.getContractFactory("PalUserToken"))
      .deploy(
        signers[0],
        "Test Token",
        "TEST",
      );
  });

  it("metadata test", async () => {
    expect(await PalUserToken.name()).to.equal("Test Token");
    expect(await PalUserToken.symbol()).to.equal("TEST");

    await PalUserToken.setName("Test Token2");
    await PalUserToken.setSymbol("TEST2");

    expect(await PalUserToken.name()).to.equal("Test Token2");
    expect(await PalUserToken.symbol()).to.equal("TEST2");
  });
});
