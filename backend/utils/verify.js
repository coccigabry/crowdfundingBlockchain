const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...")
  try {
    await run("verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (err) {
    err.message.toLowerCase().includes("already verified")
      ? console.log("Already Verified!")
      : console.error(err)
  }
}

module.exports = {
  verify,
}
