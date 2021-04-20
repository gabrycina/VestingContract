var LockedWalletFactory = artifacts.require("./LockedWalletFactory");

module.exports = function(deployer) {
  deployer.deploy(LockedWalletFactory);
};
