require("@nomiclabs/hardhat-waffle")
require('dotenv').config()

const projectId = process.env.INFURA_PROJECT_ID;
const privateKey = process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
        url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
        accounts: [privateKey]
    },
    mainnet: {
        url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
        accounts: [privateKey]
    }
  },
  solidity: "0.8.17",
};
