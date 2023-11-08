const { expect } = require("chai");

describe("NFTMarket", function () {
    it("Should create and execute market sales and create profiles", async function () {
      const Market = await ethers.getContractFactory("NFTMarket")
      const market = await Market.deploy()
      await market.deployed()
      const marketAddress = market.address

      const NFT = await ethers.getContractFactory("NFT")
      const nft = await NFT.deploy(marketAddress)
      await nft.deployed()
      const nftContractAddress = nft.address

      const Profile = await ethers.getContractFactory("Profile")
      const profile = await Profile.deploy()
      await profile.deployed()
      const profileAddress = profile.address

      const ProfileItem = await ethers.getContractFactory("ProfileItem")
      const profileItem = await ProfileItem.deploy(profileAddress)
      await profileItem.deployed()
      const profileItemAddress = profileItem.address

      let listingPrice = await market.getListingPrice()
      listingPrice = listingPrice.toString()

      let transFee = await market.getTransactionFee()
      transFee = transFee.toString()

      const _auctionPrice = ethers.utils.parseUnits('200', 'ether')
      const auctionPrice = _auctionPrice.toString()

      totalPrice = +auctionPrice + (+transFee * +auctionPrice)/100
      totalPrice = totalPrice.toString()

      await profileItem.createProfileToken("https://www.myProfileImagelocation1.com")

      await profile.createProfileItem(profileItemAddress, 1)

      await nft.createToken("https://www.mytokenlocation.com")
      await nft.createToken("https://www.mytokenlocation2.com")

      await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice })
      await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice })

      const [_, buyerAddress] = await ethers.getSigners()

      await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: totalPrice})

      let items = await market.fetchMarketItems()  

      items = await Promise.all(items.map(async i => {
        const tokenUri = await nft.tokenURI(i.tokenId)
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri,
          transFee,          
          listingPrice,
          totalPrice,
        }

        return {item}
      })) 

      let profileItems = await profile.fetchProfileItemsCreated()  

      profileItems = await Promise.all(profileItems.map(async i => {
        const profiletokenUri = await profileItem.tokenURI(i.profiletokenId)
        let profileitem = {
          proflietokenId: i.profiletokenId.toString(),
          profileCreator: i.seller,
          owner: i.owner,
          profiletokenUri,
        }

        return {profileitem}
      }))

      const nftName = "DAS NFT"
      const nftSymbol = "DAS"
      expect(await nft.name()).to.equal(nftName);
      expect(await nft.symbol()).to.equal(nftSymbol);

      console.log('items: ', items)
      console.log('profile items: ', profileItems)
      
    });
});      