// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
  console.log("Deploying token contract......");
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy("100");

  if (!token.address) {
    throw new Error("There was an error with deploying your contract. Please try again");
  }
  console.log(`Token contract deployed at address ${token.address}`);

  console.log("Deploying dex contract......");
  const Dex = await hre.ethers.getContractFactory("Dex");
  const dex = await Dex.deploy(token.address, 100);

  if (!token.address) {
    throw new Error("There was an error with deploying your contract. Please try again");
  }
  console.log(`Dex contract deployed at address ${token.address}`);

  if(await token.deployed()) {
    console.log('Token cotnract deployed successfully');
  }

  if(await dex.deployed()) {
    console.log('Dex contract deployed successfully');
  }
  await writeDeploymentInfo(token, "token.json");
  await writeDeploymentInfo(dex, "dex.json");
}

async function writeDeploymentInfo(contract, filename = "") {
  const data = {
    network: hre.network.name,
    contract: {
      address: contract.address,
      signerAddress: contract.signer.address,
      abi: contract.interface.format(),
    },
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, content, { encoding: "utf-8" });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
