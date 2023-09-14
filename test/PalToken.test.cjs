const { ethers } = require("hardhat");
const { expect } = require("chai");

let PalToken;

describe("PalToken", () => {
  beforeEach(async () => {
    const signers = await ethers.getSigners();
    PalToken = await (await ethers.getContractFactory("PalToken")).deploy(
      signers[0],
      "Test Token",
      "TEST",
    );
  });

  it("metadata test", async () => {
    expect(await PalToken.name()).to.equal("Test Token");
    expect(await PalToken.symbol()).to.equal("TEST");

    await PalToken.setName("Test Token2");
    await PalToken.setSymbol("TEST2");

    expect(await PalToken.name()).to.equal("Test Token2");
    expect(await PalToken.symbol()).to.equal("TEST2");
  });
});
