import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
    nftmarketaddress,  nftaddress
} from '../config.js'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function MyCollectedNFTs() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {  
        loadNfts()
    }, [])

    async function loadNfts() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

        let transactionFee = await marketContract.getTransactionFee()
        transactionFee = transactionFee.toString()

        const data = await marketContract.fetchMyNFTs()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
              name: meta.data.name,
              totalprice: +price + (+transactionFee * +price)/100,
              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.data.image,
              creatorName: meta.data.creatorName,
              description: meta.data.description,
            }
            return item
        }))  

        setNfts(items)
        setLoadingState('loaded')         
    }    

    if (loadingState === 'loaded' && !nfts.length) return (
        <h1 className="px-20 py-100 text-3xl text-pink-800">No NFTs owned</h1>
    )

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
                <h2 className="text-2xl py-2 font-bold text-cyan-700">Colected NFTs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
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
                                            }}
                                        >
                                            <div className="text-2xl text-sky-500 font-bold">
                                            {nft.name}
                                            </div>
                                            <div className="mt-5 text-sm text-white font-bold">
                                            {nft.description}
                                            </div>
                                            <div className="mt-2 text-xl text-sky-700 font-bold">
                                            {nft.creatorName}
                                            </div>
                                        </div>
                                </div>                                   
                                <div className="p-4 text-gray-400">
                                    <div style={{ height: '70px', overflow: 'hidden' }}>
                                        By:
                                            <p className="text-xl font-semibold text-black">{nft.creatorName} </p>
                                    </div>
                                </div>
                            </div>  
                        ))
                    }    
                </div>             
            </div>    
        </div>    
    )
}