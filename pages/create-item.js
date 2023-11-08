import { useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const ipfsClient = require('ipfs-http-client');

const gateway = process.env.INFURA_IPFS_DEDICATED_GATEWAY;
const projectId = process.env.INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
const projectIdAndSecret = `${projectId}:${projectSecret}`
const auth = `Basic ${Buffer.from(projectIdAndSecret).toString('base64')}`;

const client = ipfsClient.create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

import {
  nftaddress, nftmarketaddress
} from '../config.js'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function CreateItem () {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({price: '', creatorName: '', name: '', description: '', longdescription: '' })
    const router = useRouter()

    async function onChange(e) {
      const file = e.target.files[0]
      try {
        const added = await client.add(
          file,
          {
            progress: (prog) => console.log(`received: ${prog}`)
          }
        )
        const url = `${gateway}/${added.path}`

        client.pin.add(added.path).then((res) => {
          console.log(res)
          setFileUrl(url)
        }) 
      } catch (e) {
        console.log(e)
      }  
    }

    async function createItem() {
      const { creatorName, name, description, longdescription, price } = formInput
      if (!creatorName || !name || !description || !longdescription || !price || !fileUrl) return
      const data = JSON.stringify({
        creatorName, name, description, longdescription, image: fileUrl
      })

      try {
        const added = await client.add(data)
        const url = `${gateway}/${added.path}`
        createSale(url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }  
    }

    async function createSale(url) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
      let transaction = await contract.createToken(url)
      let tx = await transaction.wait()
       
      let event = tx.events[0]
      let value = event.args[2]
      let tokenId = value.toNumber()

      const price = ethers.utils.parseUnits(formInput.price, 'ether')

      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
      let listingPrice = await contract.getListingPrice()
      listingPrice = listingPrice.toString()

      transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
      await transaction.wait()
      router.push('/')
    }  

    return (
      <div className="flex justify-center">
        <div className="w-1/2 flex flex-col pb-12">
          <input 
            placeholder="Creator Name"
            className="mt-8 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, creatorName: e.target.value })}
          />
          <input 
            placeholder="NFT Name"
            className="mt-8 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
          />
          <textarea
            placeholder="Short Description"
            className="mt-2 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          />
          <textarea
            placeholder="Long Description"
            className="mt-2 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, longdescription: e.target.value })}
          />
          <input
            placeholder="Price in ETH"
            className="mt-2 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          />
          <input
            type="file"
            name="Asset"
            className="my-4"
            onChange={onChange}
          />
          {
            fileUrl && (
              <img className="rounded mt-4" width="350" src={fileUrl} />
            )
          }
          <button 
            onClick={createItem} 
            className="font-bold mt-4 bg-pink-800 text-white rounded p-4 shadow-lg"
          >
            Create NFT
          </button>
        </div>
      </div>
    )
}    