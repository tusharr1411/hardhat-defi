
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */

MNEMONIC = process.env.MNEMONIC 


SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY


MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY 


POLYGON_MAINNET_RPC_URL = process.env.POLYGON_MAINNET_RPC_URL
POLYGON_MAINNET_PRIVATE_KEY = process.env.POLYGON_MAINNET_PRIVATE_KEY





ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY


REPORT_GAS = process.env.REPORT_GAS.toLowerCase() === "true" || false

module.exports = {
  solidity: "0.8.7",
  networks:{
    hardhat:{
      // If you want to do some forking, uncomment this
      // forking: {
      //   url: MAINNET_RPC_URL
      // },
      chainId:31337,
    },

    localhost: {
      chainId:31337,
    },

    sepolia:{
      url:SEPOLIA_RPC_URL,
      accounts: SEPOLIA_PRIVATE_KEY !== undefined ? [SEPOLIA_PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 11155111,
      blockConfirmation: 6,
      //accounts: {
      //     mnemonic: MNEMONIC,
      // },
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: MAINNET_PRIVATE_KEY !== undefined ? [MAINNET_PRIVATE_KEY] : [],
      //   accounts: {
      //     mnemonic: MNEMONIC,
      //   },
      saveDeployments: true,
      chainId: 1,
    },
    polygon: {
      url: POLYGON_MAINNET_RPC_URL,
      accounts: POLYGON_MAINNET_PRIVATE_KEY !== undefined ? [POLYGON_MAINNET_PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 137,
    },
  },


  etherscan: {
    // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
    },
  },


  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },


  contractSizer: {
    runOnCompile: false,
    only: ["MyToken"],
  },



  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    user1: {
      default: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.4.24",
      },
    ],
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },




};



