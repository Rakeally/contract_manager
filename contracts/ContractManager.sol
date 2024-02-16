// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ContractManager {
    event ContractInfo(
        address dataOperator,
        address contractAddress,
        string description,
        string status
    );
    event ContractRemoved(address contractAddress);
    event AccessInfo(address user, string description);

    address public owner;

    mapping(address => string) public Contracts;
    mapping(address => bool) public isAuthorized;

    constructor() {
        owner = msg.sender;
        isAuthorized[owner] = true;
    }

    function grantAccess(address _user) external isOwner isValidAddress(_user) {
        require(!isAuthorized[_user], "User already authorized");
        isAuthorized[_user] = true;
        emit AccessInfo(_user, "Access granted");
    }

    function revokeAccess(
        address _user
    ) external isOwner isValidAddress(_user) {
        require(isAuthorized[_user], "Can't revoke unauthorized user");
        isAuthorized[_user] = false;
        emit AccessInfo(_user, "Access revoked");
    }

    function addContract(
        address _contractAddress,
        string memory _description
    ) external isAuthorizedUser isValidAddress(_contractAddress) {
        require(
            bytes(Contracts[_contractAddress]).length <= 0,
            "Contract address already exist"
        );
        require(
            _isValidContractAddress(_contractAddress),
            "Not a contract address"
        );
        require(bytes(_description).length > 0, "Description required");
        Contracts[_contractAddress] = _description;
        emit ContractInfo(
            msg.sender,
            _contractAddress,
            _description,
            "Contract added"
        );
    }

    function updateContractDescription(
        address _contractAddress,
        string memory _newDescription
    ) external isAuthorizedUser isValidAddress(_contractAddress) {
        require(
            bytes(Contracts[_contractAddress]).length > 0,
            "Contract address not found"
        );
        require(bytes(_newDescription).length > 0, "Description required");
        Contracts[_contractAddress] = _newDescription;
        emit ContractInfo(
            msg.sender,
            _contractAddress,
            _newDescription,
            "Contract updated"
        );
    }

    function removeContract(
        address _contractAddress
    ) external isAuthorizedUser isValidAddress(_contractAddress) {
        require(
            bytes(Contracts[_contractAddress]).length > 0,
            "Contract address not found"
        );
        delete Contracts[_contractAddress];
        emit ContractRemoved(_contractAddress);
    }

    function _isValidContractAddress(
        address _contractAddress
    ) internal view returns (bool) {
        uint size;
        assembly {
            size := extcodesize(_contractAddress)
        }
        return size > 0;
    }

    modifier isValidAddress(address _contractAddress) {
        require(_contractAddress != address(0), "Invalid address");
        _;
    }

    modifier isOwner() {
        require(owner == msg.sender, "Only owner can make this call");
        _;
    }

    modifier isAuthorizedUser() {
        require(isAuthorized[msg.sender], "Unauthorized user");
        _;
    }
}
