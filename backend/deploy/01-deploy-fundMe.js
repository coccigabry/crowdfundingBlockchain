require("dotenv").config()
const { network } = require("hardhat")
const { networkConfig, devChain } = require("../helper-hardhat-config")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress

  if (devChain.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  log("----------------------------------------------------")
  log("Deploying FundMe and waiting for confirmations...")

  const args = [ethUsdPriceFeedAddress]

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    //waitConfirmations: network.config.blockConfirmations || 1,
    waitConfirmations: 1,
  })
  log(`FundMe deployed at ${fundMe.address}`)

  //if (!devChain.includes(network.name) && process.env.ETHERSCAN_API_KEY)
  //  await verify(fundMe.address, args)
  log("It will be automatically verified!")

  log("-------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
