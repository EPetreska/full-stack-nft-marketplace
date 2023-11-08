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
  profileaddress, profileitemaddress
} from '../config.js'

import ProfileItem from '../artifacts/contracts/ProfileItem.sol/ProfileItem.json'
import Profile from '../artifacts/contracts/Profile.sol/Profile.json'

export default function CreateProfile () {
    const [profilepicUrl, setProfilePicUrl] = useState(null)
    const [formInput, updateFormInput] = useState({name: '', biography: '' })
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
          setProfilePicUrl(url)
        }) 
      } catch (e) {
        console.log(e)
      }  
    }

    async function createProfile() {
      const { name, biography } = formInput
      if (!name || !biography || !profilepicUrl) return
      const data = JSON.stringify({
        name, biography, image: profilepicUrl
      })

      try {
        const added = await client.add(data)
        const url = `${gateway}/${added.path}`
        postProfile(url)
      } catch (error) {
        console.log('Error uploading picture: ', error)
      }  
    }

    async function postProfile(url) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      let contract = new ethers.Contract(profileitemaddress, ProfileItem.abi, signer)
      let transaction = await contract.createProfileToken(url)
      let tx = await transaction.wait()
       
      let event = tx.events[0]
      let value = event.args[2]
      let profiletokenId = value.toNumber()

      contract = new ethers.Contract(profileaddress, Profile.abi, signer)

      transaction = await contract.createProfileItem(profileitemaddress, profiletokenId)
      await transaction.wait()
      router.push('/Profile')
    }  

    return (
      <div className="flex justify-center">
        <div className="w-1/2 flex flex-col pb-12">
          <input 
            placeholder="Name"
            className="mt-8 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
          />
          <textarea
            placeholder="Short biography"
            className="mt-2 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, biography: e.target.value })}
          />
          <input
            type="file"
            name="Asset"
            className="my-4"
            onChange={onChange}
          />
          {
            profilepicUrl && (
              <img className="rounded mt-4" width="350" src={profilepicUrl} />
            )
          }
          <button 
            onClick={createProfile} 
            className="font-bold mt-4 bg-pink-800 text-white rounded p-4 shadow-lg"
          >
            Create Profile
          </button>
        </div>
      </div>
    )
}    