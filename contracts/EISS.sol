// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./UniPeg.sol";

contract EISS {
    address public creator;
    address public owner;
    uint public unlockDate;
    uint public createdAt;
    uint public creationBlock;
    uint public yearOfBlocks = 2102400;
    uint public interest = 1000;
    UniPeg unipeg;

    constructor(address _creator, address _owner, address _unipegContract) {
        creator = _creator;
        owner = _owner;
        creationBlock = block.number;
        unipeg = UniPeg(_unipegContract);
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function burnInterest(address _tokenContract) onlyOwner public {
        //Take unipegs vested amount to calculate token burn amount
        uint vestedUnipeg = unipeg.balanceOf(_tokenContract);

        //Calculate blocks passed since vesting
        uint blocksPassed = block.number - creationBlock;

        //Konstant calc
        uint k = (interest/yearOfBlocks) * blocksPassed;
        
        unipeg.burn(k*vestedUnipeg);
    }
}