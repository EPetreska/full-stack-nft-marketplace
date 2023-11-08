import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftmarketaddress,  nftaddress, profileaddress, profileitemaddress
} from '../config.js'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import ProfileItem from '../artifacts/contracts/ProfileItem.sol/ProfileItem.json'
import Profile from '../artifacts/contracts/Profile.sol/Profile.json'

export default function CreatorDashboard() {
  const [profile, setProfile] = useState([])
  const [nfts, setNfts] = useState([])
  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {  
      loadNfts()
      loadProfile()
  }, [])

  async function loadProfile() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const profileContract = new ethers.Contract(profileaddress, Profile.abi, signer)
    const profileitemContract = new ethers.Contract(profileitemaddress, ProfileItem.abi, provider)
    const data = await profileContract.fetchProfileItemsCreated()

    const profileitems = await Promise.all(data.map(async i => {
      const profiletokenUri = await profileitemContract.tokenURI(i.profiletokenId)
      const meta = await axios.get(profiletokenUri)
      let profileitem = {  
        name: meta.data.name,
        biography: meta.data.biography, 
        profiletokenId: i.profiletokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return profileitem
    }))  

    setProfile(profileitems)
    setLoadingState('loaded')
  }    

  async function loadNfts() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    
    let transactionFee = await marketContract.getTransactionFee()
    transactionFee = transactionFee.toString()
    
    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          creatorName: meta.data.creatorName,  
          name: meta.data.name,
          description: meta.data.description,
          longdescription: meta.data.longdescription,
          totalprice: +price + (+transactionFee * +price)/100,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        }
        return item
    }))  

    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoadingState('loaded')
  }    

  const combineItems = () => {
    return nfts.map((item1) => {
      const matchingItem2 = profile.find(
        (item2) => item2.seller === item1.seller
      )

      return {
        ...item1,
        itemNameFromProfiles: matchingItem2 ? matchingItem2.name : 'No matching item',
      }
    })
  }

  const combineSoldItems = () => {
    return sold.map((item1) => {
      const matchingItem2 = profile.find(
        (item2) => item2.seller === item1.seller
      );

      return {
        ...item1,
        itemNameFromProfiles: matchingItem2 ? matchingItem2.name : 'No matching item',
      }
    })
  }  

  return (
    <div>
      <div className="p-4">    
        <nav className="border-b p-3">          
          <Link href="/create-profile"
            className="mr-20 text-xl text-pink-800 font-bold">
              Create Profile
          </Link>
          <Link href="/create-item"
            className="mr-20 text-xl text-pink-800 font-bold">
              Create NFT
          </Link>
          <Link href="/collected"
            className="mr-20 text-xl text-pink-800 font-bold">
              Collected NFTs
          </Link>                    
        </nav>   
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {
            profile.map((profileinfo, i) => (
              <div className="container border shadow rounded-xl overflow-visible">
                <img style={{height: '400px', width: 'auto'}} class="object-cover" src={profileinfo.image} />
                <div style={{ height: '70px' }}>
                <h1 className="text-2xl py-5 font-bold text-">{profileinfo.name}</h1>
                <p
                  style={{ height: '200px' }} className="py-4 text-black">
                    {profileinfo.biography} 
                </p>
                </div>
              </div>      
            ))
          }    
        </div>      
        <h2 className="text-2xl py-2 font-bold text-cyan-700">NFTs created</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
            {
              combineItems().map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden"> 
                  <div style={{ position: 'relative' }}>
                    <Link href={`NFTpages/${nft.tokenId}`}>
                      <img style={{height: '400px', width: 'auto'}} src={nft.image} className="rounded" />
                        <div
                          style={{
                            height: 'auto',
                            width: '310px',
                            position: 'absolute',
                            top: '75%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'black',
                            opacity: '0.7',
                            padding: '5px',
                            color: 'white',
                            borderRadius: '5px',
                          }}>
                          <div className="text-2xl text-sky-500 font-bold">
                            {nft.name}
                          </div>
                          <div className="mt-5 text-sm text-white font-bold">
                            {nft.description}
                          </div>
                          <div className="mt-2 text-xl text-sky-700 font-bold">
                            {nft.itemNameFromProfiles}
                          </div>
                        </div>
                    </Link>
                  </div>     
                  <div className="p-4 bg-pink-800">
                    <p className="text-xl font-bold text-white">{nft.totalprice} ETH</p>
                  </div>
                </div>        
              ))
            }    
          </div>
      </div>    
      <div className="px-4">
        {
          Boolean(sold.length) && (
            <div>
                <h2 className="text-2xl py-4 font-bold text-cyan-700">NFTs sold</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                    {
                      combineSoldItems().map((nft, i) => (
                        <div key={i} className="border shadow rounded-xl overflow-hidden"> 
                          <div style={{ position: 'relative' }}>                    
                            <img style={{height: '400px', width: 'auto'}} src={nft.image} className="rounded" />
                              <div
                                style={{
                                  height: 'auto',
                                  width: '310px',
                                  position: 'absolute',
                                  top: '75%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  backgroundColor: 'black',
                                  opacity: '0.7',
                                  padding: '5px',
                                  color: 'white',
                                  borderRadius: '5px',
                                }}>
                                <div className="text-2xl text-sky-500 font-bold">
                                  {nft.name}
                                </div>
                                <div className="mt-5 text-sm text-white font-bold">
                                  {nft.description}
                                </div>
                                <div className="mt-2 text-xl text-sky-700 font-bold">
                                  {nft.itemNameFromProfiles}
                                </div>
                              </div>
                          </div>    
                          <div className="p-4 bg-pink-800">
                            <p className="text-xl font-bold text-white">{nft.totalprice} ETH</p>
                          </div>
                        </div>        
                      ))
                    } 
                  </div>
            </div>       
          )
        }
      </div>    
    </div>    
  )        
}