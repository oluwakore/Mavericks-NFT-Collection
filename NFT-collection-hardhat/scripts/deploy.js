const { ethers } = require("hardhat")
require("dotenv").config({ path: ".env" })
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL }  = require("../constants")

async function main() {
  const whitelistContractAddress = WHITELIST_CONTRACT_ADDRESS

  const metadataUrl = METADATA_URL

  const mavericksContract = await ethers.getContractFactory("Mavericks")

  //deploy contract by initializing the constructor of the contract
  const deployedMavericksContract = await mavericksContract.deploy(metadataUrl, whitelistContractAddress)


  //print address of deployed contract
  console.log("Mavericks NFT Contract Address:", deployedMavericksContract.address)
}


main()
  .then(() => process.exit(0))
  .catch((err)=> {
    console.error(err)
    process.exit(1)
  })

