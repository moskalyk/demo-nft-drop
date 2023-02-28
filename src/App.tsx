import React, {useState, useEffect} from 'react';

import {ethers} from 'ethers'
import { sequence } from '0xsequence'

import { SequenceIndexerClient } from '@0xsequence/indexer'

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
const contractAddress = '0xE5e38ce8A0bB588D606f7B4A4d92E96ee62576af'

const App = () => {
  const [signedIn, setSignedIn] = useState(false)
  const [transition, setTransition] = useState('fade-in')
  const [reveal, setReveal] = useState(false)
  const [item, setItem] = useState(false)
  const [itemImage, setItemImage] = useState('')
  const [itemId, setItemId] = useState(null)
  const [itemDescription, setItemDescription] = useState(null)

  sequence.initWallet('mumbai')

  async function checkBalances(){
    const nftBalances = await indexer.getTokenBalances({
      contractAddress: contractAddress,
      accountAddress: contractAddress,
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

      const data = erc1155Interface.encodeFunctionData(
        'claim', [claimedNft, claimType == 'time' ? 0 : claimType == 'hex' ? 1 : 2]
      )

      const transaction = {
        to: contractAddress,
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
    console.log('time NFT')
    let balances = await checkBalances()
    const index = Math.floor(Array.from(Array(Math.floor(Math.random() * (balances).length * 20 + 1)).keys()).reduce((x,y) => x + Math.abs(Math.tan(y)))%(balances).length)
    claim(balances[index].id, 'time')
  }

  const hexRandom = async () => {
    console.log('hex NFT')
    let balances = await checkBalances()
    const diff = ethers.BigNumber.from(ethers.utils.hexlify(ethers.utils.randomBytes(20)))
    claim(balances[Number(diff.toString().substring(0,6)) % balances.length].id, 'hex')
  }

  const spaceRandom = async () => {
    console.log('space NFT')
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
      networkId: 8001,
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
      <br/>
      <br/>
      {/* Banner */}
      <img className="center" src="https://sequence.xyz/sequence-wordmark.svg" />
      <br/>
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
            <br/>
            { 
              ! item ? <p className={`prompt ${transition}`}>claim an NFT, choose your type of randomness</p> : null
            }
            <br/>
            <div className={`container ${transition}`}>
              <div onClick={timeRandom}><p className="random">time</p></div>
              <div onClick={hexRandom}><p className="random">hex</p></div>
              <div onClick={spaceRandom}><p className="random">space</p></div>
            </div>
          </>
        : 
          <button className="connect-button" onClick={connect}>connect</button>
      }
    </div>
  );
};

export default App;
