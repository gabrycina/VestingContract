const LockedWallet = artifacts.require("../contracts/LockedWalletFactory.sol");
const LockedWalletFactory = artifacts.require("../contracts/LockedWalletFactory.sol");

let ethToSend = web3.utils.toWei("1", "ether");
let gas = web3.utils.toWei("0.01", "ether");
let creator;
let owner;

contract('LockedWalletFactory', (accounts) => {
    let lockedWalletFactory;

    before(async () => {
        creator = accounts[0];
        owner = accounts[1];
        lockedWalletFactory = await LockedWalletFactory.new({from: creator});

    });

    it("Factory created contract is working well", async () => {
        // Create the wallet contract.
        let now = Math.floor((new Date).getTime() / 1000);
        await lockedWalletFactory.newLockedWallet(
            owner, now, {from: creator, value: ethToSend}
        );

        // Check if wallet can be found in creator's wallets.
        let creatorWallets = await lockedWalletFactory.getWallets.call(creator);
        assert(1 == creatorWallets.length);

        // Check if wallet can be found in owners's wallets.
        let ownerWallets = await lockedWalletFactory.getWallets.call(owner);
        assert(1 == ownerWallets.length);
        
        // Check if this is the same wallet for both of them.
        assert(creatorWallets[0] === ownerWallets[0]);
    });

});
