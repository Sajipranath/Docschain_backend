require("@nomicfoundation/hardhat-toolbox");


/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337, // Chain ID for Hardhat's local Ethereum network
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/exjjfYHB984qGErVVU3zxF1nZNU_yqnS", // Replace with your Alchemy Goerli API URL
      accounts: [],
    },
    sepolia: {

      url: "https://eth-sepolia.g.alchemy.com/v2/b9FML_qKuadWuTdRBSQgakL8W9tfif-A",
      accounts: ["a1d83e76d6616b86f708ca25f5f0e1c73df3b29141bb0cdbd5bb8519ee2ba0b3"],
    },
   
  },
};
