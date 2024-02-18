# Contract Manager

A smart contract for efficiently managing contract addresses and respective descriptions.

**SmartContract:** [ContractManager smartcontract](https://github.com/Rakeally/contract_manager/blob/main/contracts/contractManager.sol)

**Test script:**  [ContractManager test script](https://github.com/Rakeally/contract_manager/blob/main/test/contractManagerTest.js)

**Documentation:** [ContractManager documentation](https://github.com/Rakeally/contract_manager/blob/main/documentation/contractManagerDoc.pdf)

**ContractManager deployed and verified on sepolia testnet**: [0x547ef09cbd5cd9ad528e7d83c1b7f1fa9997f442](https://sepolia.etherscan.io/address/0x547ef09cbd5cd9ad528e7d83c1b7f1fa9997f442)

**Steps to run test script**

```shell
#install dependencies
npm i
#execute test script
npx hardhat test
#execute test script with gas consumption report
REPORT_GAS=true npx hardhat test
#execute deployment file
npx hardhat run scripts/deploy.js
```
