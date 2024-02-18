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

    //verify if function caller is owner
    modifier isOwner() {
        require(owner == msg.sender, "Only owner can make this call");
        _;
    }

    //verify if function caller has authorization
    modifier onlyAuthorizedUser() {
        require(isAuthorized[msg.sender], "Unauthorized user");
        _;
    }

    //verify if address provided is valid
    modifier isValidAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }

    //verify if provided address is a contract address
    function _isValidContractAddress(
        address _contractAddress
    ) internal view returns (bool) {
        uint size;
        assembly {
            size := extcodesize(_contractAddress)
        }
        return size > 0;
    }

    //give priviledges to users to operate in this contract manager smartcontract
    function grantAccess(address _user) external isOwner isValidAddress(_user) {
        require(!isAuthorized[_user], "User already authorized");
        isAuthorized[_user] = true;
        emit AccessInfo(_user, "Access granted");
    }

    //remove priviledges given users to operate in this contract manager smartcontract
    function revokeAccess(
        address _user
    ) external isOwner isValidAddress(_user) {
        require(isAuthorized[_user], "Can't revoke unauthorized user");
        isAuthorized[_user] = false;
        emit AccessInfo(_user, "Access revoked");
    }

    //permits authorized users to store contract addresses with respective descriptions
    function addContract(
        address _contractAddress,
        string memory _description
    ) external onlyAuthorizedUser isValidAddress(_contractAddress) {
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

    //permits authorized users to update stored contract address description
    function updateContractDescription(
        address _contractAddress,
        string memory _newDescription
    ) external onlyAuthorizedUser isValidAddress(_contractAddress) {
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

    //permits authorized users to remove stored contract address  and description
    function removeContract(
        address _contractAddress
    ) external onlyAuthorizedUser isValidAddress(_contractAddress) {
        require(
            bytes(Contracts[_contractAddress]).length > 0,
            "Contract address not found"
        );
        delete Contracts[_contractAddress];
        emit ContractRemoved(_contractAddress);
    }
}
