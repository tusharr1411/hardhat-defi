const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth,AMOUNT } = require("../scripts/getWeth");

async function main() {
    // the protocol treats everything as an ERC20 token
    await getWeth();

    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);

    // mainnet lending provider address ( aave) : 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5

    const lendingPool = await getLendingPool(signer);
    const addressOfLendingPool = await lendingPool.getAddress();

    console.log(`LendingPool address ${addressOfLendingPool}`)


    //deposite
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // from getWeth.js
    // approve the aave to get our funds
    await approveErc20(wethTokenAddress,addressOfLendingPool,AMOUNT,signer )

    console.log(`Depositing ...`)
    await lendingPool.deposit(wethTokenAddress,AMOUNT,signer, 0)
    console.log("Deposited !")
    


}

// function get address of lending pool address from the lending pool address provider
async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    );

    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)

    return lendingPool;
}


//
async function approveErc20(erc20Address, spenderAddress,amountToSpend, account){
    const erc20Token = await ethers.getContractAt("IERC20",erc20Address,account)
    const tx = await erc20Token.approve(spenderAddress,amountToSpend);
    await tx.wait(1)
    console.log("Approved !");



}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
