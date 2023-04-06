import React, {useState, useEffect} from 'react';

import {ethers} from 'ethers'
import { sequence } from '0xsequence'

import { SequenceIndexerClient } from '@0xsequence/indexer'

import timePrompt from './assets/time.png'
import hexPrompt from './assets/hex.png'
import spacePrompt from './assets/space.png'

import timeCycle from './assets/time_cycle.png'
import hexCycle from './assets/hex_cycle.png'
import spaceCycle from './assets/space_cycle.png'

import abi from './abi'

const indexer = new SequenceIndexerClient('https://mumbai-indexer.sequence.app')

var startTime: any, endTime: any;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  var ms = Math.round(timeDiff);
  return ms
}

// custom ERC1155 contract
const CONTRACT_ADDRESS = '0xE5e38ce8A0bB588D606f7B4A4d92E96ee62576af'

const App = () => {
  const [signedIn, setSignedIn] = useState(false)
  const [transition, setTransition] = useState('fade-in')
  const [reveal, setReveal] = useState(false)
  const [item, setItem] = useState(false)
  const [itemImage, setItemImage] = useState('')
  const [itemId, setItemId] = useState(null)
  const [itemDescription, setItemDescription] = useState(null)

  sequence.initWallet('mumbai')

  const wireCycles = async () => {
    const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/mumbai');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    const timeCount = Number(await contract.timeRandomness())
    const hexCount = Number(await contract.hexRandomness())
    const spaceCount = Number(await contract.spaceRandomness())

    const total = timeCount + hexCount + spaceCount
    console.log(timeCount)
    console.log(hexCount)
    console.log(spaceCount)
    document.getElementById('cycle-time')!.style!.animation! = `cycle ${timeCount != 0 ? 10*(total/timeCount) : 0}s infinite linear`
    document.getElementById('cycle-hex')!.style!.animation! = `cycle ${hexCount != 0 ? 10*(total/hexCount) : 0}s infinite linear`
    document.getElementById('cycle-space')!.style!.animation! = `cycle ${spaceCount != 0 ? 10*(total/spaceCount) : 0}s infinite linear`
  }

  useEffect(() => {
    wireCycles()
  })

  async function checkBalances(){
    const nftBalances = await indexer.getTokenBalances({
      contractAddress: CONTRACT_ADDRESS,
      accountAddress: CONTRACT_ADDRESS,
      includeMetadata: true
    })
    return nftBalances.balances.map((balance) => { return {
      id: Number(balance.tokenID),
      balance: Number(balance.balance)
    }})
  }

  const claim = async (claimedNft: any, claimType: string) => {
    try {
      const erc1155Interface = new ethers.utils.Interface([
        'function claim(uint id, uint _type)'
      ])

      const wallet = sequence.getWallet()

      const signer = wallet.getSigner()

      let claim;

      if(claimType == 'time') {
        claim = 1
      }
      else if(claimType == 'hex') {
        claim = 2
      }
      else {
        claim = 0
      }

      console.log(claim)

      const data = erc1155Interface.encodeFunctionData(
        'claim', [claimedNft, claim]
      )

      const transaction = {
        to: CONTRACT_ADDRESS,
        data: data
      }

      const txnResponse = await signer.sendTransaction(transaction)

      console.log(txnResponse)

      setItemId(claimedNft)
      setTransition('fade-out')
      setTimeout(async () => {
        setReveal(true)
        setItem(true)
        const res = await fetch(`https://bafybeibcge2ljbfhdx54wckh45da7xkbbtxbhnckgup67byj3ntgujesii.ipfs.nftstorage.link/${claimedNft}.json`)
        const metadata = await res.json()
        setItemImage(`${metadata.image}`)
        setItemDescription(metadata.name)
      }, 4000)
    } catch(e: any) {
      console.log('ERROR')
      if(e.code == '3') {
        if(claimType == 'time'){
          timeRandom()
        } else if(claimType == 'hex') {
          hexRandom()
        } else {
          spaceRandom()
        }
      }
    }
  }

  const timeRandom = async () => {
    let balances = await checkBalances()
    const index = Math.floor(Array.from(Array(Math.floor(Math.random() * (balances).length * 20 + 1)).keys()).reduce((x,y) => x + Math.abs(Math.tan(y)))%(balances).length)
    claim(balances[index].id, 'time')
  }

  const hexRandom = async () => {
    let balances = await checkBalances()
    const diff = ethers.BigNumber.from(ethers.utils.hexlify(ethers.utils.randomBytes(20)))
    claim(balances[Number(diff.toString().substring(0,6)) % balances.length].id, 'hex')
  }

  const spaceRandom = async () => {
    start()
    let balances = await checkBalances()
    const ttl = end()
    const claimedNft = balances[ttl % (balances).length].id
    claim(claimedNft, 'space')
  }

  const openWallet = async () => {
    const wallet = sequence.getWallet()
    wallet.openWallet()
  }

  const connect = async () => {
    const wallet = sequence.getWallet()

    const connectWallet = await wallet.connect({
      app: 'drop',
      authorize: true,
      networkId: 80001,
      settings: {
        theme: 'light'
      }
    })

    if(connectWallet.connected == true) setSignedIn(true)
  }
  return (
    <div >
      {/* Loading */}
      {transition == 'fade-out' && !reveal ? <div className="loading">Loading&#8230;</div> : null}
      {/* Banner */}
      <img className="center" src="https://sequence.xyz/sequence-wordmark.svg" />
      <br/>
      {/* Pulled Item */}
      {
        item ? 
        (
          <>
            <img className="center item-card" src={itemImage} />
            <p className="item fade-in">You pulled {itemDescription}</p>
            <button className='connect-button center' onClick={openWallet}>see wallet</button>
          </>
        ) : null
      }
      {/* randomization shelf */}
      {
        signedIn ? 
          <>
            { 
              ! item ? <p className={`prompt ${transition}`}>claim a card <br/><br/>choose your type of randomness</p> : null
            }
            <div className={`container ${transition}`}>
              <img onClick={timeRandom} src={timePrompt} className="randomized-prompt" />
              <img onClick={hexRandom} src={hexPrompt} className="randomized-prompt"/>
              <img onClick={spaceRandom} src={spacePrompt} className="randomized-prompt"/>
              <div className="row">
                <div className="column"><p className="random">time</p></div>
                <div className="column"><p className="random">hex</p></div>
                <div className="column"><p className="random">space</p></div>
              </div>
            </div>
          </>
        : (
          <>
            <p className='prompt'>mint an element <br/><br/>choosing your randomness</p>
            <br/>
            <button className="connect-button" onClick={connect}>connect</button>
            <br/>
            <br/>
            <div className="row">
                <div className="column"><img src={timeCycle} className='wheel-lg' id="cycle-time"/></div>
                <div className="column"><img src={hexCycle} className='wheel' id="cycle-hex"/></div>
                <div className="column"><img src={spaceCycle} className='wheel' id="cycle-space"/></div>
              </div>
          </>
          )
      
      }
    </div>
  );
};

export default App;
