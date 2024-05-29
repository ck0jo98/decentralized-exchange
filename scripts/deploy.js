const hre = require('hardhat');
const fs = require('fs/promises');

async function main() {
    const Token = hre.ethers.getContractFactory('Token');
    const token = (await Token).deploy('100');

    const Dex = hre.ethers.getContractFactory('Dex');
    const dex = (await Dex).deploy(token.address, 100);

    await token.deployed();
    await dex.deployed();

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
