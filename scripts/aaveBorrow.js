const { getNamedAccounts, ethers, network } = require("hardhat");
const { getWeth,AMOUNT } = require("../scripts/getWeth");


const {networkConfig} = require("../helper-hardhat-config");
const BORROW_MODE = 2 // variable borrow mode. Stable(1) is disabled



async function main() {
    // the protocol treats everything as an ERC20 token
    await getWeth();

    // get signer from accounts
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);

    // mainnet lending provider address ( aave) : 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5

    //connect lending pool with signer
    const lendingPool = await getLendingPool(signer);
    const addressOfLendingPool = await lendingPool.getAddress();
    console.log(`LendingPool address ${addressOfLendingPool}`)


    const wethTokenAddress = networkConfig[network.config.chainId].wethToken // from getWeth.js
    
    
    // approve the aave to get our funds
    await approveErc20(wethTokenAddress,addressOfLendingPool,AMOUNT,signer )
    console.log(`Depositing ...`)
    await lendingPool.deposit(wethTokenAddress,AMOUNT,signer, 0)
    console.log("Deposited !")

    // Getting your borrowing stats
    let {availableBorrowsETH, totalDebtETH} = await getBorrowUserData(lendingPool,signer);
    // Borrowing  // what is the conversion rate DAI is ?( we have to use chainlink price feed for the price of DAI)
    // how much we have borrowed , how much we have in collateral, how much we can borrow
    // for this we have getUserAccountData() function in aave
    const daiPrice = await getDAIprice();
    const amountDAItoBorrow = availableBorrowsETH.toString()* 0.95 * (1 / daiPrice.toString());
    console.log(`You can Borrow: ${amountDAItoBorrow}  DAI`)
    const amountDAItoBorrowWei = ethers.parseEther(amountDAItoBorrow.toString())
    console.log(`You can Borrow: ${amountDAItoBorrowWei}  wei`)


    const daiTokenAddress = networkConfig[network.config.chainId].daiToken;
    await borrowDai(daiTokenAddress, lendingPool, amountDAItoBorrowWei,signer);

    //to console userdata again
    await getBorrowUserData(lendingPool,signer);



    //repay the debt
    await repay(amountDAItoBorrowWei, daiTokenAddress, lendingPool, signer)
    await getBorrowUserData(lendingPool,signer);


}








// function to get the address of lending pool from the lending pool address provider
async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.config.chainId].lendingPoolAddressesProvider,
        account
    );
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool;
}


// approve
async function approveErc20(erc20Address, spenderAddress,amountToSpend, account){
    const erc20Token = await ethers.getContractAt("IERC20",erc20Address,account)
    const tx = await erc20Token.approve(spenderAddress,amountToSpend);
    await tx.wait(1)
    console.log("Approved !");
}


// function get user data
async function getBorrowUserData(lendingPool, account){
    const {totalCollateralETH, totalDebtETH, availableBorrowsETH} = await lendingPool.getUserAccountData(account)
    console.log(`You have deposited : ${totalCollateralETH} weth.`)
    console.log(`You have borrowed: ${totalDebtETH} weth.`)
    console.log(`You can borrow: ${ availableBorrowsETH} weth `)
    return {availableBorrowsETH, totalDebtETH};
}


// function to get proce of DAI using chainlink price feed
async function getDAIprice(){
    const DaiETHPriceFeed = await ethers.getContractAt("AggregatorV3Interface",networkConfig[network.config.chainId].daiEthPriceFeed)
    const price = (await DaiETHPriceFeed.latestRoundData())[1];
    console.log(`The DAI/ETH price is: ${price.toString()}`)
    return price;
}


//function to borrow dai
async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account){
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei,BORROW_MODE,0,account);
    await borrowTx.wait(1);
    console.log(`You have borrowed !`)

}


// function to repay
async function repay(amount, daiAddress, lendingPool, account){
    // const addressOfLendingPool = await lendingPool.getAddress();
    await approveErc20(daiAddress,lendingPool.target, amount, account);
    const repayTx = await lendingPool.repay(daiAddress,amount, BORROW_MODE, account)
    await repayTx.wait(1);

    console.log("Repaid !")


}





main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});
