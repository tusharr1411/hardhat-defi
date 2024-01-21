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

    let {availableBorrowsETH, totalDebtETH} = await getBorrowUserData(lendingPool,signer);
    // Borrowing  // what is the conversion rate DAI is ?( we have to use chainlink price feed for the price of DAI)
    // how much we have borrowed , how much we have in collateral, how much we can borrow
    // for this we have getUserAccountData() function in aave

    const daiPrice = await getDAIprice();
    console.log("This is the value: ", daiPrice)


    const amountDAItoBorrow = availableBorrowsETH.toString()* 0.95 * (1 / daiPrice.toString());

    console.log(`You can Borrow: ${amountDAItoBorrow}  DAI`)

    const amountDAItoBorrowWei = ethers.parseEther(amountDAItoBorrow.toString())
    console.log(`You can Borrow: ${amountDAItoBorrowWei}  wei`)


    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrowDai(daiTokenAddress, lendingPool, amountDAItoBorrowWei,signer);

    //to console userdata again
    await getBorrowUserData(lendingPool,signer);












      



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


// approve
async function approveErc20(erc20Address, spenderAddress,amountToSpend, account){
    const erc20Token = await ethers.getContractAt("IERC20",erc20Address,account)
    const tx = await erc20Token.approve(spenderAddress,amountToSpend);
    await tx.wait(1)
    console.log("Approved !");
}


/// 
async function getBorrowUserData(lendingPool, account){
    const {totalCollateralETH, totalDebtETH, availableBorrowsETH} = await lendingPool.getUserAccountData(account)
    console.log(`You have deposited : ${totalCollateralETH} weth.\nYou have borrowed: ${totalDebtETH} weth.\nYou can borrow: ${ availableBorrowsETH} weth `)
    return {availableBorrowsETH, totalDebtETH};
}


// function to get proce of DAI
async function getDAIprice(){
    const DaiETHPriceFeed = await ethers.getContractAt("AggregatorV3Interface","0x773616E4d11A78F511299002da57A0a94577F1f4")
    const price = (await DaiETHPriceFeed.latestRoundData())[1];
    console.log(`The DAI/ETH price is: ${price.toString()}`)
    return price;
}


//function to borrow dai
async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account){
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei,2,0,account);
    await borrowTx.wait(1);
    console.log(`You have borrowed !`)

}





main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});
