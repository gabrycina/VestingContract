const LockedWallet = artifacts.require("../contracts/LockedWallet.sol");

//Set up a default amount of ether and gas to test with
let ethToSend = web3.utils.toWei("1", "ether");
let gas = web3.utils.toWei("0.01", "ether");
let creator;
let owner;

contract('LockedWallet', (accounts) => {
    let lockedWallet;

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
        await lockedWallet.send(ethToSend, {from: creator});
        assert(ethToSend == await web3.eth.getBalance(lockedWallet.address));
        
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
        let Token = await Token.new({from: creator});
        
        //check contract initiated well and has 1M of tokens
        assert(1000000000000 == await Token.balanceOf(creator));        

        //load the wallet with some tokens
        let amountOfTokens = 1000000000;
        await Token.transfer(LockedWallet.address, amountOfTokens, {from: creator});

        //check that LockedWallet has Tokens
        assert(amountOfTokens == await Token.balanceOf(lockedWallet.address));

        //now withdraw tokens
        await lockedWallet.withdrawTokens(Token.address, {from: owner});

        //check the balance is correct
        let balance = await Token.balanceOf(owner);
        assert(balance.toNumber() == amountOfTokens);
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
