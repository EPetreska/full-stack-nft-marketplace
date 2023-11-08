import '../styles/globals.css'
import Link from 'next/link'
import Image from "next/image"
import logo1 from '../public/logo1.jpg'

function MyApp({ Component, pageProps }) {

  return (
    <div>
      <nav className="p-2">
        <div className="flex mt-6">         
          <Link href="/"
            className="mr-2">
              <Image style={{height: '100px', width: 'auto'}} src={logo1} />
          </Link>
          <Link href="/" 
          className="mr-20 p-4 text-3xl text-indigo-800 font-bold">
             <div >Decentralized Arts and Sciences
              <br />
              <p className="text-xl text-indigo-800 font-bold"> NFT Marketplace </p>
             </div>    
          </Link>                  
        </div>  
        <div className="flex mt-2"> 
          <Link href="/about"
            className="p-2 mt-6 mr-6 text-xl text-indigo-800 font-bold">
              About
          </Link>
        </div>
        <div className="p-2 mt-4">
          <Link href="/Profile"
            className=" text-xl text-gray-600 font-bold">
              Profile
          </Link>
        </div>          
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp