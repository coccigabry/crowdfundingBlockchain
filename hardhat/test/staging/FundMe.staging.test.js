const { network, ethers, getNamedAccounts } = require("hardhat")
const { devChain } = require("../../helper-hardhat-config")
const { assert } = require("chai")

devChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe
      let deployer
      const sendValue = ethers.utils.parseEther("0.1")

      beforeEach(async () => {
        // deploy fundMe contract using hardhat-deploy
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)

        assert.equal(endingBalance.toString(), "0")
      })
    })
