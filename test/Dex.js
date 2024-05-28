const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dex", () => {
  let dexAddress;
  let tokenAddress;
  let tokenSupply = "100";

  let token;
  let dex;

  let price = 100;

  let owner;
  let addr1;
  let addr2;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);

    tokenAddress = await token.getAddress();
    const Dex = await ethers.getContractFactory("Dex");
    dex = await Dex.deploy(tokenAddress, price);
    dexAddress = await dex.getAddress();
  });

  describe("Sell", () => {
    it("should fail if contract is not approved", async () => {
      await expect(dex.sell()).to.be.reverted;
    });

    it("should allow DEX to transfer tokens", async () => {
      await token.approve(await dex.getAddress(), 100);
    });

    it("should not allow non-owner to call sell()", async () => {
      await expect(dex.connect(addr1).sell()).to.be.reverted;
    });

    it("should transfer tokens from owner to contract", async () => {
      await expect(dex.sell()).to.changeTokenBalances(
        token,
        [owner.address, dexAddress],
        [-100, 100]
      );
    });
  });

  describe("Getters", () => {
    it("should returun correct token balance", async () => {
      expect(await dex.getTokenBalance()).to.equal(100);
    });

    it("should returun correct token price", async () => {
      expect(await dex.getPrice(10)).to.equal(price * 10);
    });
  });

  describe("Buy", () => {
    it("user can buy tokens", async () => {
      await expect(
        dex.connect(addr1).buy(10, { value: 1000 })
      ).to.changeTokenBalances(token, [dexAddress, addr1.address], [-10, 10]);
    });

    it("user cannot buy invalid number of tokens", async () => {
      await expect(
        dex.connect(addr1).buy(95, { value: 9500 })
      ).to.be.revertedWith("Not enough tokens");
    });

    it("user cannot buy by invalid value of tokens", async () => {
      await expect(dex.connect(addr1).buy(10, { value: 9 })).to.be.rejectedWith(
        "Invalid value sent"
      );
    });
  });

  describe("Withdraw tokens", () => {
    it("non-owner cannot withdraw tokens", async () => {
      await expect(dex.connect(addr1).withdrawTokens()).to.be.revertedWith(
        "You are not the owner"
      );
    });

    it("owner can withdraw tokens", async () => {
      await expect(dex.withdrawTokens()).to.changeTokenBalances(
        token,
        [dexAddress, owner.address],
        [-90, 90]
      );
    });
  });

  describe("Withdraw funds", () => {
    it("non-owner cannot withdraw funds", async () => {
      await expect(dex.connect(addr1).withdrawFunds()).to.be.revertedWith(
        "You are not the owner"
      );
    });

    it("owner can withdraw funds", async () => {
      await expect(dex.withdrawFunds()).to.changeEtherBalances(
        [owner.address, dexAddress],
        [1000, -1000]
      );
    });
  });
});
