// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract Profile is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _profileitemIds;

    address owner;

    struct ListedProfileToken {
        uint256 profiletokenId;
        address payable owner;
        address payable seller;
        bool currentlyListed;
    }

    event ProfileTokenListedSuccess (
        uint256 indexed profiletokenId,
        address owner,
        address seller,
        bool currentlyListed
    );

    mapping(uint256 => ListedProfileToken) private idToListedProfileToken;

    constructor() {
        owner = payable(msg.sender); 
    }

    struct ProfileItem {
        uint profileitemId;
        address profileContract;
        uint256 profiletokenId;
        address payable seller;
        address payable owner;
    }   

    mapping(uint256 => ProfileItem) private idToProfileItem;

    event ProfileItemCreated (
        uint indexed profileitemId,
        address indexed profileContract,
        uint256 indexed profiletokenId,
        address seller,
        address owner
    );

    function getLatestIdToListedToken() public view returns (ListedProfileToken memory) {
        uint256 currentProfileTokenId = _profileitemIds.current();
        return idToListedProfileToken[currentProfileTokenId];
    }

    function getListedTokenForId(uint256 profiletokenId) public view returns (ListedProfileToken memory) {
        return idToListedProfileToken[profiletokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _profileitemIds.current();
    }

    function createProfileItem(
      address profileContract,
      uint256 profiletokenId
    ) public payable nonReentrant {

      _profileitemIds.increment();
      uint256 profileitemId = _profileitemIds.current();

      idToProfileItem[profileitemId] = ProfileItem(
          profileitemId,
          profileContract,
          profiletokenId,
          payable(msg.sender),
          payable(address(0))
      );

      IERC721(profileContract).transferFrom(msg.sender, address(this), profiletokenId);

      emit ProfileItemCreated(
        profileitemId,
        profileContract,
        profiletokenId,
        msg.sender,
        address(0)
      );
    }

    function fetchProfileItems() public view returns (ProfileItem[] memory) {
      uint profileitemCount = _profileitemIds.current();
      uint unsoldProfileItemCount = _profileitemIds.current();
      uint currentIndex = 0;

      ProfileItem[] memory items = new ProfileItem[](unsoldProfileItemCount);
      for (uint i = 0; i < profileitemCount; i++) {
        if (idToProfileItem[i + 1].owner == address(0)) {
          uint currentProfileId = idToProfileItem[i + 1].profileitemId;
          ProfileItem storage currentProfileItem = idToProfileItem[currentProfileId];
          items[currentIndex] = currentProfileItem;
          currentIndex += 1;
        }
      } 
      return items;
    }

    function fetchProfileItemsCreated() public view returns (ProfileItem[] memory) {
      uint totalProfileItemCount = _profileitemIds.current();
      uint profileitemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalProfileItemCount; i++) {
        if (idToProfileItem[i + 1].seller == msg.sender) {
          profileitemCount += 1;
        }
      }

      ProfileItem[] memory items = new ProfileItem[](profileitemCount);
      for (uint i = 0; i < totalProfileItemCount; i++) {
        if (idToProfileItem[i + 1].seller == msg.sender) {
          uint currentprofileId = idToProfileItem[i + 1].profileitemId;
          ProfileItem storage currentprofileItem = idToProfileItem[currentprofileId];
          items[currentIndex] = currentprofileItem;
          currentIndex += 1;
        }
      }
      return items;
    }  
}