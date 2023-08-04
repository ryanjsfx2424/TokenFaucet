import { useState } from "react";
import Web3 from "web3";
import CONTRACT_ABI from "./abi_v1.json"

const CHAIN_ID = "0x5";
const CHAIN_NAME = "Goerli";
const CONTRACT_ADDRESS = "0x694f84ca8aa5CA98e1437DCbe316E1e5EbC3E3B1"

function App() {
  const [isConnected, setIsConnected] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install metamask or login.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
      });
      const account = accounts[0];
  
      const chainId = await window.ethereum.request({
          method: "eth_chainId",
      });
  
      if (chainId !== CHAIN_ID) {
          alert("Connected to wrong chain! Please change to " + CHAIN_NAME)
      } else {
          alert("Connected to account: " + String(account) + 
                  " and chainId: " + String(chainId));
          setIsConnected(true);
      }
  
    } catch {
        alert("Something went wrong connecting. Refresh and try again.");
    }
  }

  async function donate() {
    const web3 = new Web3(window.ethereum);
    let gasPriceEstimate = await web3.eth.getGasPrice();
    console.log({gasPriceEstimate1: gasPriceEstimate});
    gasPriceEstimate = String(gasPriceEstimate)
    console.log({gasPriceEstimate2: gasPriceEstimate});
    let firstDigit = Array.from(gasPriceEstimate)[0];
    firstDigit = Number(firstDigit)
    firstDigit *= 3
    gasPriceEstimate = String(firstDigit) + gasPriceEstimate.substring(1)
    //gasPriceEstimate += "0";
    console.log({gasPriceEstimate3: gasPriceEstimate});

    try {
      await web3.eth.sendTransaction({
        from: window.ethereum.selectedAddress,
        to: CONTRACT_ADDRESS,
        value: web3.utils.toWei("1", "ether"),
        gasPrice: gasPriceEstimate
      })
    } catch (error) {
      console.log(error)
      alert("Tx failed. Perhaps you cancelled the tx. Or perhaps you selected a wallet that is not (yet) connected to this site. Otherwise, please contact the devs!");
    }
  }

  async function withdraw() {
    console.log("CONTRACT_ABI: ", CONTRACT_ABI);
    //Web3EthContract.setProvider(window.ethereum);
    const web3 = new Web3(window.ethereum);
    let SmartContractObj = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    console.log("SmartContractObj: ", SmartContractObj);

    let gasLimitEstimate;
    try {
      gasLimitEstimate = await SmartContractObj.methods.withdraw(web3.utils.toWei("1", "ether")).estimateGas({
        from: window.ethereum.selectedAddress,
        to: CONTRACT_ADDRESS
      });
    } catch (error) {
      console.log({error: error});
      alert("Error during estimating gas. Maybe faucet doesn't have enough eth?");
      return;
    }
    console.log({gasLimitEstimate: gasLimitEstimate})
    gasLimitEstimate = Math.round(1.2*Number(String(gasLimitEstimate)));
    console.log({gasLimitEstimate2: gasLimitEstimate})

    let gasPriceEstimate = await web3.eth.getGasPrice();
    console.log({gasPriceEstimate: gasPriceEstimate});
    gasPriceEstimate = Math.round(1.2*Number(String(gasPriceEstimate)));
    console.log({gasPriceEstimate2: gasPriceEstimate});
    gasPriceEstimate = String(gasPriceEstimate);

    let firstDigit = Array.from(gasPriceEstimate)[0];
    firstDigit = Number(firstDigit)
    firstDigit *= 5
    gasPriceEstimate = String(firstDigit) + gasPriceEstimate.substring(1)

    gasPriceEstimate += "0".repeat(4);

    try {
      const result = await SmartContractObj.methods.withdraw(web3.utils.toWei("1", "ether")).send({
        from: window.ethereum.selectedAddress,
        to: CONTRACT_ADDRESS,
        gasLimit: gasLimitEstimate,
        gasPrice: gasPriceEstimate
      });
      console.log(result);
    } catch (error) {
      console.log({error: error});
      alert("Error during withdraw.");
      return;
    }
  }

  return (
    <div>
        <h1>Token Faucet</h1>
        {!isConnected ?
          <button onClick={connectWallet}>Connect Wallet</button>
        :
          <div>
            <button onClick={donate}>Donate 1 Eth to the Faucet</button>
            <button onClick={withdraw}>Withdraw 1 Eth from the Faucet</button>
          </div>
        }
    </div>
  );
}

export default App;
