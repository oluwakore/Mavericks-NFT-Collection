//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract Mavericks is ERC721Enumerable, Ownable  {

 string _baseTokenURI;

 IWhitelist whitelist;

 bool public presaleBegin;

 uint256 public presaleCompleted;

 uint256 maximumTokenIds = 30;

 uint256 public tokenIds;

 uint256 public _presalePrice = 0.002 ether; 

 uint256 public _publicPrice = 0.05 ether;

 bool public _isPaused;


 modifier onlyWhenNotPaused {
    require(!_isPaused, "Contract currently paused!");
    _;
 }

constructor(string memory baseURI, address whitelistContract) ERC721("Mavericks", "MAV") {
  _baseTokenURI = baseURI;
   whitelist = IWhitelist(whitelistContract);
}


function beginPresale() public onlyOwner {
  presaleBegin = true;
  presaleCompleted = block.timestamp + 10 minutes;
}

function presaleMint() public payable onlyWhenNotPaused {
      require(presaleBegin && block.timestamp < presaleCompleted, "Presale ended");
      require(whitelist.whitelistedAddresses(msg.sender), "You are not a whitelist beneficiary");
      require(tokenIds < maximumTokenIds, "Limit reached!");
      require(msg.value >= _presalePrice, "Ether sent is not correct");

      tokenIds += 1;

      _safeMint(msg.sender, tokenIds);
}

function mint() public payable onlyWhenNotPaused {
    require(presaleBegin && block.timestamp >= presaleCompleted, "Presale has not ended!");
    require(tokenIds < maximumTokenIds, "Limit reached!");
     require(msg.value >= _publicPrice, "Ether sent is not correct");
    tokenIds += 1;

    _safeMint(msg.sender, tokenIds);    
   }

  function _baseURI() internal view virtual override returns(string memory) {
    return _baseTokenURI;
  }


    function setPaused(bool val) public onlyOwner {
      _isPaused = val;
    }
   


    function withdraw() public onlyOwner {
      address _owner = owner();
      uint256 amount = address(this).balance;
      (bool sent, ) = _owner.call{value: amount}("");
      require(sent, "Failed to send Ether");
    }







    receive() external payable {}

    fallback() external payable {}



}


