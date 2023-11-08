import { ethers } from 'ethers'
import axios from 'axios'
import { useRouter } from 'next/router';

import {
    nftaddress, nftmarketaddress
  } from '../../config.js'
  
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

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

  return new Promise((resolve) => {
    resolve(items);    
  });    
}   

export default function NFTpage ({ item }) {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {item ? (
        <div className="container border shadow rounded-xl overflow-hidden">
          <div style={{ position: 'relative' }}>
            <img style={{height: 'auto', width: '2500px'}} class="object-cover" src={item.image} />
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
                    {item.name}
                  </div>
                  <div className="mt-5 text-sm text-white font-bold">
                    {item.description}
                  </div>
                  <div className="mt-2 text-xl text-sky-700 font-bold">
                    {item.creatorName}
                  </div>
              </div>
          </div>
          <div style={{ height: '70px' }}>
            <h1 className="text-2xl py-5 font-bold text-">{item.name}</h1>
              <p className="py-4 text-cyan-600"> {item.description} </p>
              <p className="text-black"> {item.longdescription} </p>
          </div>
        </div>
      ) : (
        <p>Item not found</p>
      )}
    </div>
  );
}

export async function getStaticPaths() {
  const loadedNFTs = await loadNFTs ()
  const paths = loadedNFTs.map((item) => ({
    params:{ id: item.tokenId.toString() },
  }))

  return {
    paths,
    fallback: true,
  };
}
    
export async function getStaticProps({ params }) {
  const id = parseInt(params.id)  
  const loadedNFTs = await loadNFTs()
  const item = loadedNFTs.find((item) => item.tokenId === id)

  return {
    props: {
      item,
    },
  }       
}  
      
    