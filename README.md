# Contract Manager

A smart contract for efficiently managing contract addresses and respective descriptions.

**SmartContract:** [ContractManager smartcontract](https://github.com/Rakeally/contract_manager/blob/main/contracts/contractManager.sol)
**Test script:**  [ContractManager test script](https://github.com/Rakeally/contract_manager/blob/main/test/contractManagerTest.js)
**Documentation:** [ContractManager documentation](https://github.com/Rakeally/contract_manager/blob/main/documentation/contractManagerDoc.pdf)

**Steps for test**

```shell
<!--install dependencies-->
npm i
<!--execute test script-->
npx hardhat test
<!--execute test script with gas consumption report-->
REPORT_GAS=true npx hardhat test
<!--execute deployment file-->
npx hardhat run scripts/deploy.js
```
