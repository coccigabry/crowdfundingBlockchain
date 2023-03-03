const { network } = require("hardhat")
const {
  devChain,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  if (devChain.includes(network.name)) {
    log("Local Network detected! Deploying mocks...")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    log("Mocks deployed!")
    log("-------------------------------------------------------")
  }
}

module.exports.tags = ["all", "mocks"]
