// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const ContractManager = await ethers.getContractFactory("ContractManager");
  const contractManager = await ContractManager.deploy();

  await contractManager.waitForDeployment();

  console.log("ContractManager deployed to:", contractManager.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
