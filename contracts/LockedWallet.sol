// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract LockedWallet { 
    address public creator;
    address public owner;
    uint public unlockDate;
    uint public createdAt;

    event Received(address from, uint amount);
    event Withdrew(address to, uint amount);
    event WithdrewTokens(address tokenContract, address to, uint amount);
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor (address _creator, address _owner, uint _unlockDate) {
        creator = _creator;
        owner = _owner;
        unlockDate = _unlockDate;
        createdAt = block.timestamp;
    }

    // keep all the ether sent to this address
    receive() external payable { 
        emit Received(msg.sender, msg.value);
    }

    // callable by owner only, after specified time
    function withdraw() onlyOwner public {
       
       require(block.timestamp >= unlockDate);

       //now send all the balance
       payable(msg.sender).transfer(address(this).balance);
       Withdrew(msg.sender, address(this).balance);
    }

    // callable by owner only, after specified time, only for Tokens implementing ERC20
    function withdrawTokens(address _tokenContract) onlyOwner public {
       require(block.timestamp >= unlockDate);
       ERC20 token = ERC20(_tokenContract);
       //now send all the token balance
       uint tokenBalance = token.balanceOf(address(this));
       token.transfer(owner, tokenBalance);
       WithdrewTokens(_tokenContract, msg.sender, tokenBalance);
    }

    function info() public view returns(address, address, uint, uint, uint) {
        return (creator, owner, unlockDate, createdAt, address(this).balance);
    }
}