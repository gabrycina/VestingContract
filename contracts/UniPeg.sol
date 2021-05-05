// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "openzeppelin-solidity/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./SafeMath.sol";

contract UniPeg is ERC20, ERC20Burnable, Ownable {

	constructor(uint256 initialSupply) ERC20("UniPeg", "UPG") {
        mint(msg.sender, initialSupply);
    }

	function mint(address _to, uint256 _amount) public onlyOwner() {
		_mint(_to, _amount);
	}
}
