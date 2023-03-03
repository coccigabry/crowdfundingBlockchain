const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { devChain } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!devChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.utils.parseEther("1")

      beforeEach(async () => {
        // deploy fundMe contract using hardhat-deploy
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async () => {
        it("sets aggregator addresses correctly", async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe("fund", async () => {
        it("fails if you do not send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          )
        })

        it("updated amount funded data strcture", async () => {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })

        it("adds funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue })
          const funder = await fundMe.getFunder(0)
          assert.equal(funder, deployer)
        })
      })

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single funder", async () => {
          // arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // act
          const trxRes = await fundMe.withdraw()
          const trxReceipt = await trxRes.wait(1)

          const finalFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const finalDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // get gas cost
          const { gasUsed, effectiveGasPrice } = trxReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          // assert
          assert.equal(finalFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          )
        })

        it("withdraw ETH from multiple funders", async () => {
          // arrange
          const accounts = await ethers.getSigners()
          for (let i = 0; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // act
          const trxRes = await fundMe.withdraw()
          const trxReceipt = await trxRes.wait(1)

          const finalFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const finalDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // get gas cost
          const { gasUsed, effectiveGasPrice } = trxReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          // assert
          assert.equal(finalFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          )
          // make sure funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted
          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("only owner can withdraw", async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await fundMe.connect(attacker)

          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          )
        })

        it("CHEAPER withdraw ETH from a single funder", async () => {
          // arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // act
          const trxRes = await fundMe.cheaperWithdraw()
          const trxReceipt = await trxRes.wait(1)

          const finalFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const finalDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // get gas cost
          const { gasUsed, effectiveGasPrice } = trxReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          // assert
          assert.equal(finalFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          )
        })

        it("CHEAPER withdraw ETH from multiple funders", async () => {
          // arrange
          const accounts = await ethers.getSigners()
          for (let i = 0; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // act
          const trxRes = await fundMe.cheaperWithdraw()
          const trxReceipt = await trxRes.wait(1)

          const finalFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const finalDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // get gas cost
          const { gasUsed, effectiveGasPrice } = trxReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          // assert
          assert.equal(finalFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          )
          // make sure funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted
          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })
      })
    })
