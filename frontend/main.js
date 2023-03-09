import { ethers } from "./utils/ethers-5.6.esm.min.js";
import { contractAddress, abi } from "./utils/constants.js";

const connectBtn = document.querySelector("#connectBtn");
const fundInput = document.querySelector("#fundInput");
const fundBtn = document.querySelector("#fundBtn");
const balanceBtn = document.querySelector("#balanceBtn");
const withdrawBtn = document.querySelector("#withdrawBtn");

let isConnect = false;

connectBtn.addEventListener("click", async () => {
  if (typeof window.ethereum !== undefined) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectBtn.setAttribute("disabled", "");
    connectBtn.textContent = "Wallet Connected";
    isConnect = true;
  } else {
    connectBtn.setAttribute("disabled", "");
    connectBtn.textContent = "Please install MetaMask!";
  }
});

fundBtn.addEventListener("click", async () => {
  const ethAmount = fundInput.value;
  console.log(`Funding ${ethAmount} ETH...`);
  if (isConnect) {
    // provider - connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // signer - wallet - someone with some gas
    const signer = provider.getSigner();
    // contract that we are interesting with ABI & address
    const contract = new ethers.Contract(contractAddress, abi, signer);
    // now we can send payment
    try {
      const trxRes = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTrxMine(trxRes, provider);
      console.log("Thank you for funding!");
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log("Please connect your Wallet!");
  }
});

balanceBtn.addEventListener("click", async () => {
  if (isConnect) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`Current balance is ${ethers.utils.formatEther(balance)} ETH`);
  } else {
    console.log("Please connect your Wallet!");
  }
});

withdrawBtn.addEventListener("click", async () => {
  if (isConnect) {
    console.log(`Withdrawing...`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const trxRes = await contract.withdraw();
      await listenForTrxMine(trxRes, provider);
      console.log(`Withdrawed successfully!`);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log("Please connect your Wallet!");
  }
});

const listenForTrxMine = (trxRes, provider) => {
  console.log(`Mining trx number ${trxRes.hash}...`);
  return new Promise((resolve, reject) => {
    provider.on(trxRes.hash, (trxReceipt) => {
      console.log(`Completed with ${trxReceipt.confirmations} confirmations`);
      resolve();
    });
  });
};
