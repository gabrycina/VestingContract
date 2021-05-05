const LockedWallet = artifacts.require("../contracts/LockedWallet.sol");
const UniPeg = artifacts.require('UniPeg');
const truffleAssert = require('truffle-assertions');

//Set up a default amount of ether and gas to test with
let ethToSend = web3.utils.toWei("1", "ether");
let gas = web3.utils.toWei("0.01", "ether");
let creator;
let owner;

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('openzeppelin-test-helpers');

contract('LockedWallet', (accounts) => {
    let lockedWallet;
    const TOTAL_SUPPLY = new BN('21000000');

    before(async () => {
        creator = accounts[0];
        owner = accounts[1];
        other = accounts[2];
    });

    it("Owner can withdraw the funds after the unlock date", async () => {

        //set unlock date in unix epoch to now
        let now = Math.floor(Date.now() / 1000);
        
        //create the contract and load the contract with some eth
        lockedWallet = await LockedWallet.new(creator, owner, now);
        let tx = await lockedWallet.send(ethToSend, {from: creator});
        
        //See if received event is emitted when eth sent
        truffleAssert.eventEmitted(tx, 'Received', async (ev) => {
            return ethToSend == await web3.eth.getBalance(lockedWallet.address);
        });
        
        let balanceBefore = await web3.eth.getBalance(owner);
        
        await lockedWallet.withdraw({from: owner});
        
        let balanceAfter = await web3.eth.getBalance(owner);
        assert(balanceAfter - balanceBefore >= ethToSend - gas);
    });


    it("Nobody can withdraw the funds before the unlock date", async () => {
        //set unlock date in unix epoch to some future date
        let futureTime = Math.floor(Date.now() / 1000) + 50000;

        //create the contract
        lockedWallet = await LockedWallet.new(creator, owner, futureTime);

        //load the contract with some eth
        await lockedWallet.send(ethToSend, {from: creator});
        assert(ethToSend == await web3.eth.getBalance(lockedWallet.address));
        try {
            await lockedWallet.withdraw({from: owner})
            assert(false, "Expected error not received");
        } catch (error) {
        } //expected

        try {
            await lockedWallet.withdraw({from: creator})
            assert(false, "Expected error not received");
        } catch (error) {
        } //expected

        try {
            await lockedWallet.withdraw({from: other})
            assert(false, "Expected error not received");
        } catch(error) {
        } //expected

        //contract balance is intact
        assert(ethToSend == await web3.eth.getBalance(lockedWallet.address));
    });

    it("Nobody other than the owner can withdraw funds after the unlock date", async () => {
        //set unlock date in unix epoch to now
        let now = Math.floor(Date.now() / 1000);

        //create the contract
        lockedWallet = await LockedWallet.new(creator, owner, now);

        //load the contract with some eth
        await lockedWallet.send(ethToSend, {from: creator});
        assert(ethToSend == await web3.eth.getBalance(lockedWallet.address));

        try {
          await lockedWallet.withdraw({from: creator})
          assert(false, "Expected error not received");
        } catch(error) {
        } //expected

        try {
          await lockedWallet.withdraw({from: other})
          assert(false, "Expected error not received");
        } catch(error) {
        } //expected

        //contract balance is intact
        assert(ethToSend == await web3.eth.getBalance(lockedWallet.address));
    });

    it("Owner can withdraw Tokens after the unlock date", async () => {

        //set unlock date in unix epoch to now
        let now = Math.floor(Date.now() / 1000);

        //create the wallet contract 
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

        //now withdraw unipegs
        await lockedWallet.withdrawTokens(unipeg.address, {from: owner});

        //check the balance is correct
        let balance = await unipeg.balanceOf(owner);
        assert(balance.toNumber() == amountOfUnipegs);
    });

    it("Allow getting info about the wallet", async () => {
        // Remember current time.
        let now = Math.floor(Date.now() / 1000);
        // Set unlockDate to future time.
        let unlockDate = now + 100000;
        // Create new LockedWallet.
        lockedWallet = await LockedWallet.new(creator, owner, unlockDate);
        // Send ether to the wallet.        
        await lockedWallet.send(ethToSend, {from: creator});
        
        // Get info about the wallet. 
        let info = await lockedWallet.info();

        // Compare result with expected values.
        assert(info[0] == creator);
        assert(info[1] == owner);
        assert(info[2].toNumber() == unlockDate);
        assert(info[3].toNumber() == now);
        assert(web3.utils.toBN(info[4]) == ethToSend);
    });

});
