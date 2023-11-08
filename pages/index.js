import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import Web3Modal from "web3modal"
import sampleNFTs from '../sampleNfts.json'

import {
  nftaddress, nftmarketaddress, profileaddress, profileitemaddress
} from '../config.js'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import ProfileItem from '../artifacts/contracts/ProfileItem.sol/ProfileItem.json'
import Profile from '../artifacts/contracts/Profile.sol/Profile.json'

export default function Home() {
  const [samplenfts, setsampleNfts] = useState([])
  const [nfts, setNfts] = useState([])
  const [profiles, setProfile] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadsampleNFTs()
    loadNFTs()
    loadProfiles()  
  }, [])

  async function loadProfiles() {
    const provider = new ethers.providers.JsonRpcProvider()

    const profileContract = new ethers.Contract(profileaddress, Profile.abi, provider)
    const profileitemContract = new ethers.Contract(profileitemaddress, ProfileItem.abi, provider)
    const data = await profileContract.fetchProfileItems()

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

  async function loadsampleNFTs() { 
    const items = sampleNFTs.sampleNfts.map( i => ({
      id: i.id,
      image: i.image,
      name: i.name,
      creatorid: i.samplestudents.id,
      creatorName: i.samplestudents.creatorName,
      description: i.description,
      priceplusfee: i.priceplusfee,
      tokenId: i.tokenId
    }))

    setsampleNfts(items)
    setLoadingState('loaded')
  } 

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider()

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)

    let transactionFee = await marketContract.getTransactionFee()
    transactionFee = transactionFee.toString() 

    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let priceplusfee = +price + (+transactionFee * +price)/100
      let item = {
        price,
        priceplusfee,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        creatorName: meta.data.creatorName,
        name: meta.data.name,
        description: meta.data.description,
        longdescription: meta.data.longdescription,
      }
      return item
    }))  

    setNfts(items)
    setLoadingState('loaded')
  }  

  const combineItems = () => {
    return nfts.map((item1) => {
      const matchingItem2 = profiles.find(
        (item2) => item2.seller === item1.seller
      )

      return {
        ...item1,
        itemNameFromProfiles: matchingItem2 ? matchingItem2.name : 'No matching item',
        itemIdFromProfiles: matchingItem2 ? matchingItem2.profiletokenId : 'No matching item',
      }
    })
  }

  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let transactionFee = await contract.getTransactionFee()
    transactionFee = transactionFee.toString()

    const priceplusfee = ethers.utils.parseUnits(nft.priceplusfee.toString(), "ether")
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: priceplusfee
    })
    await transaction.wait()
    loadNFTs()
  }

  return (       
    <div className="flex justify-center">
      <div className="px-10" style={{ maxWidth: '1500px'}}>
        <h2 className="border border-gray-300 px-4 text-2xl py-2 font-bold text-cyan-700">Sample NFTs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
            {
              samplenfts.map((samplenft, i) => (
                <div key={i} className="border border-white shadow rounded-xl overflow-hidden">
                  <div style={{ position: 'relative' }}>
                    <Link href={`samples/${samplenft.id}`}>
                    <img style={{height: '400px', width: 'auto'}} class="object-cover" src={samplenft.image} />
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
                        {samplenft.name}
                      </div>
                      <div className="mt-5 text-sm text-white font-bold">
                        {samplenft.description}
                      </div>
                      <div className="mt-2 text-xl text-sky-700 font-bold">
                        {samplenft.creatorName}
                      </div>
                    </div>
                    </Link>
                  </div>                   
                  <div className="p-4 text-gray-400">                 
                    <div style={{ height: '60px', overflow: 'hidden' }}>
                      By:    
                      <p className="text-xl font-bold mb-4 text-black">
                        <Link href={`samples/sampleNfts/${samplenft.id}/samplestudents/${samplenft.creatorid}`}>
                          {samplenft.creatorName}
                        </Link>
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-700">
                    <p className="text-xl mb-4 font-bold text-white">{samplenft.priceplusfee} ETH</p>
                    <p className="w-full bg-pink-700 text-white text-center font-bold py-2 px-12 rounded"> Buy</p>
                  </div>
                </div>
              ))
            }
            {
              combineItems().map((nft, i) => (
                <div key={i} className="border border-white shadow rounded-xl overflow-hidden">
                    <div style={{ position: 'relative' }}>
                      <Link href={`NFTpages/${nft.tokenId}`}>
                      <img style={{height: '400px', width: 'auto'}} class="object-cover" src={nft.image} />
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
                    <div className="p-4 text-gray-400">
                      <div style={{ height: '60px', overflow: 'hidden' }}>
                        By:
                        <p>
                          <Link href={`Profilepages/${nft.itemIdFromProfiles}`} className="text-xl font-semibold text-black">
                            {nft.itemNameFromProfiles}
                          </Link>
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-700">
                      <p className="text-xl mb-4 font-bold text-white">{nft.priceplusfee} ETH</p>
                      <button className="w-full bg-pink-700 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                    </div>
                </div>
              ))
            }
          </div>
      </div>
    </div> 
  )
}