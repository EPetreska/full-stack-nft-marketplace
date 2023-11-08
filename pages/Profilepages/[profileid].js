import { ethers } from 'ethers'
import axios from 'axios'
import { useRouter } from 'next/router';

import {
  profileaddress, profileitemaddress
} from '../../config.js'

import ProfileItem from '../../artifacts/contracts/ProfileItem.sol/ProfileItem.json'
import Profile from '../../artifacts/contracts/Profile.sol/Profile.json'

async function loadProfiles() {
    const provider = new ethers.providers.JsonRpcProvider()
    const profileitemContract = new ethers.Contract(profileitemaddress, ProfileItem.abi, provider)
    const profileContract = new ethers.Contract(profileaddress, Profile.abi, provider)
    
    const data = await profileContract.fetchProfileItems()
    
    const profileitems = await Promise.all(data.map(async i => {
        const profiletokenUri = await profileitemContract.tokenURI(i.profiletokenId)
        const meta = await axios.get(profiletokenUri)
        
        let profileitem = {        
        profiletokenId: i.profiletokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,    
        name: meta.data.name,
        biography: meta.data.biography,       
        }
        return profileitem
    })) 
    
    return new Promise((resolve) => {
        resolve(profileitems);        
    })     
}   

export default function Profilepage ({ profileitem }) {    
    const router = useRouter();
    
    if (router.isFallback) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {profileitem ? (
                <div className="container border shadow rounded-xl overflow-hidden">              
                    <img style={{height: 'auto', width: '2500px'}} class="object-cover" src={profileitem.image} />       
                        <div style={{ height: '70px' }}>
                            <h1 className="text-2xl py-5 font-bold text-">{profileitem.name}</h1>
                                <p className="py-4 text-black"> {profileitem.biography} </p>                 
                        </div>
                </div>               
            ) : (
                <p>Item not found</p>               
            )}
        </div>
    );
}

export async function getStaticPaths() {
    const loadedProfiles = await loadProfiles ()
    const paths = loadedProfiles.map((profileitem) => ({
        params:{ profileid: profileitem.profiletokenId.toString() },
    }))

    return {
        paths,
        fallback: true,
    };
}
    
export async function getStaticProps({ params }) {
    const profileid = parseInt(params.profileid)
    const loadedProfiles = await loadProfiles()
    const profileitem = loadedProfiles.find((profileitem) => profileitem.profiletokenId === profileid)

    return {
        props: {
            profileitem,
        },
    }
}  
      
    


   


