# demo-nft-drop
This is a toy example for how to empower artists to drop ERC1155 NFTs via an interface that enables users to choose between 3 sources of randomization across: time, hex, & space.

## how to run
```
$ yarn
$ yarn start
```

### randomization
- time: processor Math.random() && tangent function
- hex: ethers crypto hex
- space: ttl p2p round trip from a node or server

### inventory edge cases
Currently if there is a large influx of users that claim all IDs of an item, randomization does not take into account of exhausted inventory between relayer transactions (~2 seconds). This can be addressed using a couple solutions. Better error checking for balance onchain which is the current solution with repeat pulls, but is limited by time between polygon transactions. Or, ensuring timing is near instant for an off-chain cache, that stores in-progress transactions in a cache and balance checking in an off-chain nodejs process, so we aim to get to a single unique random pull per user.

Q: How much is this edge case a problem? 

Considering equal distribution of 6 items, taking the time for an average transaction of 2 second, there's a ~17% chance if 2 users are racing to get the final item. Therefore, randomization should be retried until transaction successful.

## tools used
- react
- sequence

TODO:
- [ ] media upload to ipfs (i.e. web3.storage)
- [ ] contract deploy
- [ ] ui for assigning item quantity count
