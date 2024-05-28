const { expect } = require("chai");

describe("Token", () => {
  let tokenSupply = "100";
  let token;
  let owner;
  let addr1;
  let addr2;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);
  });

  describe("Deployment", () => {
    it("should assign total supply of tokens to the owner/deployed", async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("should transfer tokens between accounts", async () => {
        await token.transfer(addr1.address, "50");
        const addr1Balance = await token.balanceOf(addr1.address);
        expect(addr1Balance).to.equal("50");
    });

    it("should fail to transfer more tokens than available", async () => {
        const address1 = token.connect(addr1);
        await expect(address1.transfer(addr2.address, "101")).to.be.reverted;
    });
  });
});
