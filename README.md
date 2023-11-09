# A full stack NFT Marketplace on Etherium with Polygon, Solidity, IPFS, Next.js, Hardhat, and Ethers.js.

Decentralized Arts and Sciences (DAS) is a digital marketplace where academics can promote and sell their accomplishments as NFTs. Users can create a profile including a profile picture and a short bio, and they can mint and list NFTs for sale. Users can also buy and collect NFTs. Buyers pay 1% transaction fee. The marketplace includes sample NFTs for demonstration.

## Functionalities:

* Mint and upload NFTs to IPFS;
* List NFTs for sell;
* Buy NFTs and transfer funds between buyers’ and sellers’ crypto wallets; 
* Transfer transaction fee to marketplace owner;
* Create user’s profile and upload profile picture to IPFS;
* User’s profile with sections for Created, Sold, and Collected NFTs.

## Running the project locally

1. Clone the project

```
git clone https://github.com/EPetreska/full-stack-nft-marketplace.git
```
2. Change to the project’s directory

```
cd full-stack-nft-marketplace
```
3. Install the dependencies using NPM

```
npm install
```

or Yarn

```
yarn
```
4. (This step can be skipped) Test the contracts:

```
npx hardhat test
```
5. Start the local Hardhat node

```
npx hardhat node
```
6. In a new terminal window deploy the contracts to the local network

```
npx hardhat run scripts/deploy.js --network localhost
```
7. Update the code with the steps from Code Configuration

8. Start the application

```
npm run dev
```
and open http://localhost:3000

9. Change the network in your Metamask wallet to Localhost 8545. To test the marketplace import an account to your Metamasak wallet from the list of accounts provided in the terminal where you ran the local node using the account’s address and Private Key. This will give you 10000 ETH for testing.

10. In Profile you can create a profile page and list NFTs for sell. You can buy the listed NFTs by switching to a different account in your wallet.

## Code Configuration

Before running the app locally one needs to update the code with their specific project's info and contract addresses.

### Infura for IPFS project ID and project Key

We use Infura IPFS API with a dedicated gateway to store on IPFS. Create a free account on Infura and click on “Create new API key”. Choose IPFS from the options. In the project's page Enable dedicated gateways and choose your Unique subdomain name. Create .evn file in the root directory and paste your Infura Dedicated Gateway, Project Key, and Project Secret:

INFURA_IPFS_DEDICATED_GATEWAY=”https://example.infura-ipfs.io/ipfs”
INFURA_IPFS_PROJECT_ID=""
INFURA_IPFS_PROJECT_SECRET=""

### Contract addresses

After deploying the contracts to the local network, update the config.example.js file with their addresses found in the same terminal window (change the name of the file to config.js).

## Running the project on Polygon Mumbai testnet and Mainnet

To run the project on Polygon Mumbai testnet and Mainnet create a new project on Infura choosing Web3 API. Then update the .env file with the Infura project ID and the private key of the Metamask account that will be used for deplying the contracts. Add the Mumbai and Mainnet networks to Metamask using the endpoints from your Infura project. Obtain some test Matic from the Matic Faucet. Deploy the contracts with:

```
npx hardhat run scripts/deploy.js --network mumbai
```

or

```
npx hardhat run scripts/deploy.js --network mainnet
```
