pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

contract EthereumInstantMessenger {
    event MessageSent(
        address indexed to,
        address indexed from,
        string message,
        uint256 blockNumber,
        bool encrypted
    );

    mapping(address => string) registeredUsersPubKey;
    bytes32 constant emptyString = keccak256("");

    constructor() payable {
        // what should we do on deploy?
    }

    // register to receive encrypted messages
    function register(string memory pubKey) public {
        registeredUsersPubKey[msg.sender] = pubKey;
    }

    function sendMessage(address recipient, string memory messageContents, bool encrypted)
        public
    {
        require(!encrypted || keccak256(bytes(registeredUsersPubKey[recipient])) != emptyString, "Recipient must register before you can send them an encrypted message.");
    
        emit MessageSent(recipient, msg.sender, messageContents, block.number, encrypted);
    }

    function getUserPubKey(address user) public view returns (string memory _pubKey) {
        return registeredUsersPubKey[user];
    }

    // to support receiving ETH by default and receive 
    receive() external payable {}

    fallback() external payable {}
}
