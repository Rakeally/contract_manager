const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractManager", async function () {
  let signers;
  let contractManager;
  const invalidAddress = "0x0000000000000000000000000000000000000000";

  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    const ContractManager = await ethers.getContractFactory("ContractManager");
    contractManager = await ContractManager.deploy();

    await contractManager.waitForDeployment();
  });

  describe("Test contract deployment", async () => {
    it("should deploy successfully", async function () {
      expect(contractManager.target).to.not.undefined;
      expect(contractManager.target).to.not.equal(invalidAddress);
    });
  });

  describe("Test access grant", async () => {
    it("should revert if not contract owner", async function () {
      try {
        await contractManager
          .connect(signers[2])
          .grantAccess(signers[3].getAddress());

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Only owner can make this call");
      }
    });

    it("should revert if user address is invalid", async function () {
      try {
        await contractManager.grantAccess(invalidAddress);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Invalid address");
      }
    });

    it("should revert if user already has authorized access", async function () {
      try {
        await contractManager.grantAccess(signers[2].getAddress());
        await contractManager.grantAccess(signers[2].getAddress());

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("User already authorized");
      }
    });

    it("should successfully grant access of a user", async function () {
      const accessGranted = await contractManager.grantAccess(
        signers[2].getAddress()
      );
      const verify = await contractManager.isAuthorized(signers[2]);

      expect(accessGranted.hash).to.not.undefined;
      expect(accessGranted.hash).to.be.a("string");
      expect(verify).to.be.a("boolean").and.equals(true);
    });
  });

  describe("Test access revoke", async () => {
    it("should revert if caller is not contract owner", async function () {
      try {
        await contractManager
          .connect(signers[2])
          .revokeAccess(signers[3].getAddress());

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Only owner can make this call");
      }
    });

    it("should revert if user address is invalid", async function () {
      try {
        await contractManager.revokeAccess(invalidAddress);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Invalid address");
      }
    });

    it("should revert if user doesn't have authorized access", async function () {
      try {
        await contractManager.revokeAccess(signers[2].getAddress());
        await contractManager.revokeAccess(signers[2].getAddress());

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Can't revoke unauthorized user");
      }
    });

    it("should successfully revoke access of a user", async function () {
      await contractManager.grantAccess(signers[2].getAddress());
      const accessRevoke = await contractManager.revokeAccess(
        signers[2].getAddress()
      );

      const verify = await contractManager.isAuthorized(signers[2]);

      expect(accessRevoke.hash).to.not.undefined;
      expect(accessRevoke.hash).to.be.a("string");
      expect(verify).to.be.a("boolean").and.equals(false);
    });
  });

  describe("Test contract info saving", async () => {
    it("should revert if caller is unauthorized", async function () {
      const contractAddress = contractManager.target;
      const description = "This contract is about contract management";
      try {
        await contractManager
          .connect(signers[2])
          .addContract(contractAddress, description);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Unauthorized user");
      }
    });

    it("should revert if trying to add an invalid address", async function () {
      const description = "This contract is about contract management";

      try {
        await contractManager.addContract(invalidAddress, description);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Invalid address");
      }
    });

    it("should revert if trying to add a non existent contract", async function () {
      const description = "This contract is about contract management";

      try {
        const userAddress = "0xd59ba1d313685E79753Fbe3dAe0FD60a01BE79F3";
        await contractManager.addContract(userAddress, description);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Not a contract address");
      }
    });

    it("should revert if trying to add a contract address with empty description", async function () {
      try {
        const emptyDescription = "";
        await contractManager.addContract(
          contractManager.target,
          emptyDescription
        );

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Description required");
      }
    });

    it("should revert if trying to save a contract address that already exist", async function () {
      const description = "This contract is about contract management";

      try {
        await contractManager.grantAccess(signers[2].getAddress());

        await contractManager
          .connect(signers[2])
          .addContract(contractManager.target, description);

        await contractManager
          .connect(signers[2])
          .addContract(contractManager.target, description);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Contract address already exist");
      }
    });

    it("should successfully save a contract address with respective description", async function () {
      const description = "This contract is about contract management";

      await contractManager.grantAccess(signers[2].getAddress());

      const saveContractDetails = await contractManager
        .connect(signers[2])
        .addContract(contractManager.target, description);

      const verifySaveData = await contractManager.Contracts(
        contractManager.target
      );
      expect(saveContractDetails.hash).to.not.undefined;
      expect(saveContractDetails.hash).to.be.a("string");
      expect(verifySaveData).to.be.a("string").and.equal(description);
    });
  });

  describe("Test contract description update", async () => {
    it("should revert if caller is unauthorized", async function () {
      const newDescription = "Updating this contract description";
      try {
        await contractManager
          .connect(signers[2])
          .updateContractDescription(contractManager.target, newDescription);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Unauthorized user");
      }
    });

    it("should revert if trying to update an invalid address", async function () {
      try {
        await contractManager.grantAccess(signers[2].getAddress());

        await contractManager
          .connect(signers[2])
          .updateContractDescription(invalidAddress, "newDescription");

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Invalid address");
      }
    });

    it("should revert if trying to update a non existent contract", async function () {
      const nonExistentAddress = "0x57397e7799Bf33f2Ec3aAB37A0302e03ABB3fE08";
      try {
        await contractManager.grantAccess(signers[2].getAddress());

        await contractManager
          .connect(signers[2])
          .updateContractDescription(nonExistentAddress, "newDescription");

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Contract address not found");
      }
    });

    it("should revert if trying to update a contract with empty description", async function () {
      const emptyDescription = "";

      try {
        await contractManager.grantAccess(signers[2].getAddress());

        await contractManager
          .connect(signers[2])
          .addContract(contractManager.target, "my newly created contract");

        await contractManager
          .connect(signers[2])
          .updateContractDescription(contractManager.target, emptyDescription);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Description required");
      }
    });

    it("should successfully update a contract description", async function () {
      await contractManager.grantAccess(signers[2].getAddress());

      await contractManager
        .connect(signers[2])
        .addContract(contractManager.target, "my newly created contract");

      const updateContractDescription = await contractManager
        .connect(signers[2])
        .updateContractDescription(
          contractManager.target,
          "updated contract description"
        );

      const verifyUpdate = await contractManager.Contracts(
        contractManager.target
      );

      expect(updateContractDescription.hash).to.not.undefined;
      expect(updateContractDescription.hash).to.be.a("string");
      expect(verifyUpdate)
        .to.be.a("string")
        .and.equal("updated contract description");
    });
  });

  describe("Test contract removal", async () => {
    it("should revert if caller is unauthorized", async function () {
      try {
        await contractManager
          .connect(signers[2])
          .removeContract(contractManager.target);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Unauthorized user");
      }
    });

    it("should revert if trying to remove an invalid address", async function () {
      try {
        await contractManager.grantAccess(signers[2].getAddress());

        await contractManager
          .connect(signers[2])
          .removeContract(invalidAddress);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Invalid address");
      }
    });

    it("should revert if trying to remove a non existent contract", async function () {
      const nonExistentAddress = "0x57397e7799Bf33f2Ec3aAB37A0302e03ABB3fE08";

      try {
        await contractManager.grantAccess(signers[2].getAddress());

        await contractManager
          .connect(signers[2])
          .removeContract(nonExistentAddress);

        expect.fail("Expected a revert");
      } catch (error) {
        expect(error.message).to.contain("Contract address not found");
      }
    });

    it("should successfully remove a contract", async function () {
      await contractManager.grantAccess(signers[2].getAddress());
      await contractManager
        .connect(signers[2])
        .addContract(contractManager.target, "my newly created contract");
      const removeContract = await contractManager
        .connect(signers[2])
        .removeContract(contractManager.target);

      const verifyRemoval = await contractManager.Contracts(
        contractManager.target
      );
      expect(removeContract.hash).to.not.undefined;
      expect(removeContract.hash).to.be.a("string");
      expect(verifyRemoval).to.be.a("string").and.equal("");
    });
  });
});
