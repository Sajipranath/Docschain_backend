const hre = require("hardhat");
const { ethers } = require('ethers');

async function main() {

  


const contentStorageFactory = await hre.ethers.getContractFactory("ContentStorage");
  const contentStorage = await contentStorageFactory.deploy();

await contentStorage.waitForDeployment();

 console.log("Contract deployed to:", await contentStorage.getAddress());
 



}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
