const LockedWalletFactory = artifacts.require("./LockedWalletFactory");
const UniPeg = artifacts.require('UniPeg');

module.exports = async function (deployer) {
  await deployer.deploy(UniPeg, '21000000');
  await deployer.deploy(LockedWalletFactory);
};
