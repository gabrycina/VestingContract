// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract UniPeg is ERC20, Ownable{
	constructor(uint256 initialSupply) ERC20("UniPeg", "UPG") {
        _mint(msg.sender, initialSupply);
    }

	function mint(address _to, uint256 _amount) public onlyOwner() {
		_mint(_to, _amount);
	}
}
