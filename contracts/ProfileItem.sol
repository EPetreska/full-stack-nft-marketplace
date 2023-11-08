// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProfileItem is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _profiletokenIds;
    address contractAddress;

    constructor(address profileAddress) ERC721("DAS NFT", "DAS") {
        contractAddress = profileAddress;
    }

    function createProfileToken(string memory tokenURI) public returns (uint) {
        _profiletokenIds.increment();
        uint256 newProfileItemId = _profiletokenIds.current();
        //require(newProfileItemId == 1, "Profile is already created");

        _mint(msg.sender, newProfileItemId);
        _setTokenURI(newProfileItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newProfileItemId;
    }
}