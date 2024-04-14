// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContentStorage {
    struct Content {
        address uploader;
        string hashValue; // Original hash value
        uint256 timestamp;
    }

    mapping(bytes32 => Content) private contentMap;
    mapping(string => bool) private hashExists; // Store the existence of the hash

    event ContentUploaded(address indexed uploader, string hashValue, uint256 indexed timestamp, bytes32 key);

    receive() external payable { }

    function uploadContent(string memory _hashValue) external {
        require(bytes(_hashValue).length > 0, "Hash value cannot be empty");
        require(!hashExists[_hashValue], "Hash already exists"); // Check if hash exists

        bytes32 key = keccak256(abi.encodePacked(_hashValue));

        contentMap[key] = Content({
            uploader: msg.sender,
            hashValue: _hashValue,
            timestamp: block.timestamp
        });

        hashExists[_hashValue] = true; // Mark the hash as existing

        emit ContentUploaded(msg.sender, _hashValue, block.timestamp, key);
    }

    function getContentDetails(bytes32 _key) external view returns (address, string memory, uint256) {
        require(contentMap[_key].uploader != address(0), "Content not found");

        Content memory content = contentMap[_key];

        return (content.uploader, content.hashValue, content.timestamp);
    }
}
