const { getNamedAccounts, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config")

const AMOUNT = ethers.parseEther("0.02");


async function getWeth() {
    // const deployer = await getNamedAccounts();
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);

    //call the "deposite" function on the Weth contract
    //we need ABI, contract address
    const iWeth = await ethers.getContractAt(
        "IWeth",
        networkConfig[network.config.chainId].wethToken,
        signer
    );
    const tx = await iWeth.deposit({value: AMOUNT});
    await tx.wait(1);
    const wethBalance = await iWeth.balanceOf(signer)
    console.log(`Got ${wethBalance.toString()} WETH `)
    
}

module.exports = { getWeth, AMOUNT };
