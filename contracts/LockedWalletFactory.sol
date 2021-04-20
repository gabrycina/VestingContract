// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./LockedWallet.sol";

contract LockedWalletFactory {
    mapping(address => address[]) wallets;

    function getWallets(address _user) 
        public
        view
        returns(address[] memory)
    {
        return wallets[_user];
    }

    function newLockedWallet(address _owner, uint256 _unlockDate)
        payable
        public
        returns(address payable wallet)
    {
        // Create new wallet.
        LockedWallet lockedWallet = new LockedWallet(msg.sender, _owner, _unlockDate);
        wallet = payable(address(lockedWallet));

        // Add wallet to sender's wallets.
        wallets[msg.sender].push(wallet);

        // If owner is not the same as sender then add wallet to sender's wallets too.
        if(msg.sender != _owner){
            wallets[_owner].push(wallet);
        }

        // Send ether from this transaction to the created contract.
        wallet.transfer(msg.value);

        // Emit event.
        Created(wallet, msg.sender, _owner, block.timestamp, _unlockDate, msg.value);
    }

    // Prevents accidental sending of ether to the factory
    fallback () external { revert("the check is failing"); }

    event Created(address wallet, address from, address to, uint256 createdAt, uint256 unlockDate, uint256 amount);
}