const hre = require("hardhat");

async function main() {
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  const Profile = await hre.ethers.getContractFactory("Profile");
  const profile = await Profile.deploy();
  await profile.deployed();
  console.log("profile deployed to:", profile.address);

  const ProfileItem = await hre.ethers.getContractFactory("ProfileItem");
  const profileItem = await ProfileItem.deploy(profile.address);
  await profileItem.deployed();
  console.log("profileItem deployed to:", profileItem.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
      process.exit(1);
  });
