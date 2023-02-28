// contracts/GameItems.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract GameItems is ERC1155 {

    uint256 public timeRandomness = 0;
    uint256 public hexRandomness = 0;
    uint256 public spaceRandomness = 0;

    uint256 public constant HYDROGEN = 0;
    uint256 public constant BRONZE = 1;
    uint256 public constant GEAR = 2;
    uint256 public constant SODIUM = 3;
    uint256 public constant SULFUR = 4;
    uint256 public constant AETHER = 5;

    constructor() public ERC1155("https://bafybeifr2ugaueljk5tixayp3uhr57zsf6qqpx4jdpx5iw72pwym6mga4m.ipfs.nftstorage.link/{id}.json") {
        _mint(address(this), HYDROGEN, 20, "");
        _mint(address(this), BRONZE, 4, "");
        _mint(address(this), GEAR, 10, "");
        _mint(address(this), SODIUM, 25, "");
        _mint(address(this), SULFUR, 50, "");
        _mint(address(this), AETHER, 1000000, "");
    }

    function claim(uint id, uint _type) public returns (bool) {
        ERC1155(this).safeTransferFrom(address(this), msg.sender, id, 1, "");
        if(_type == 0){
            spaceRandomness++;
        }else if(_type == 1){
            timeRandomness++;
        } else {
            hexRandomness++;
        }
    }
}