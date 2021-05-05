// test/UniPeg.test.js
// SPDX-License-Identifier: MIT

const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('openzeppelin-test-helpers');

// Load compiled artifacts
const UniPeg = artifacts.require('UniPeg');

// Start test block
contract('UniPeg', function ([ creator, other ]) {

  const NAME = 'UniPeg';
  const SYMBOL = 'UPG';
  const TOTAL_SUPPLY = new BN('21000000');

  beforeEach(async function () {
    this.token = await UniPeg.new(TOTAL_SUPPLY);
  });

  it('retrieve returns a value previously stored', async function () {
    // Use large integer comparisons
    expect(await this.token.totalSupply()).to.be.bignumber.equal(TOTAL_SUPPLY);
  });

  it('has a name', async function () {
    expect(await this.token.name()).to.be.equal(NAME);
  });

  it('has a symbol', async function () {
    expect(await this.token.symbol()).to.be.equal(SYMBOL);
  });

  it('assigns the initial total supply to the creator', async function () {
    expect(await this.token.balanceOf(creator)).to.be.bignumber.equal(TOTAL_SUPPLY);
  });
});