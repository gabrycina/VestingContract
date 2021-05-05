// SPDX-License-Identifier: MIT
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants, time } = require('openzeppelin-test-helpers');
const truffleAssert = require('truffle-assertions');

// Load compiled artifacts
const EISS = artifacts.require('EISS');
const UniPeg = artifacts.require('UniPeg');
const LockedWallet = artifacts.require("../contracts/LockedWallet.sol");

contract('EISS', (accounts) =>{
    let eiss, lockedWallet;
    const TOTAL_SUPPLY = new BN('21000000');
    
    before(async () => {
        creator = accounts[0];
        owner = accounts[1];
        other = accounts[2];
    });

    //TODO: Substitute k params with real values for testing
    it('EISS burn interest test' , async() => {
        let now = Math.floor((new Date).getTime() / 1000);
        lockedWallet = await LockedWallet.new(creator, owner, now);

        //create Token contract
        let unipeg = await UniPeg.new(TOTAL_SUPPLY);

        //check contract initialized well and has 1M of unipegs
        assert(21000000 == await unipeg.balanceOf(creator)); 

        //load the wallet with some unipegs
        let amountOfUnipegs = 1000;
        let tx = await unipeg.transfer(lockedWallet.address, amountOfUnipegs, {from: creator});

        //See if received event is emitted when UPG sent
        truffleAssert.eventEmitted(tx, 'Transfer', async (ev) => {
            return amountOfUnipegs == await unipeg.balanceOf(lockedWallet.address);
        });

        let creationBlock = await web3.eth.getBlockNumber()

        //Increase time by 3 month in the blockchain
        await time.increaseTo((await time.latest()).add(time.duration.weeks(12)));
        
        //Burn interest
        eiss = await EISS.new(creator, owner, lockedWallet.address);
        eiss.burnInterest(lockedWallet.address);

        //Calculating constant k for final assertion:
        //k should be the same as the one the contract is using 
        //to process our request.
        let vestedUnipeg = amountOfUnipegs;
        let blockNumber = await web3.eth.getBlockNumber();
        let blocksPassed = blockNumber - creationBlock;

        //Reset to 3 Months if greater
        if(blocksPassed > 525600)
            blocksPassed = 525600;
        
        let k = (1000/2102400) * blocksPassed;

        const totalSupply = await unipeg.totalSupply();

        console.log(totalSupply);
        assert.equal(totalSupply , totalSupply - k*vestedUnipeg);
      });
});

