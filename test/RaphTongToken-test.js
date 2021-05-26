const { expect } = require('chai')

describe("RaphTongToken", function () {
  const NAME = 'RaphTongToken'
  const SYMBOL = 'RTT'
  const TOTAL_SUPPLY = ethers.utils.parseEther('945')
  const ZERO_ADDRESS = ethers.constants.AddressZero
  let RaphTongToken, raphTongToken, dev, owner, alice, bob, charlie

  beforeEach(async function () {
    [dev, owner, alice, bob, charlie] = await ethers.getSigners()
    RaphTongToken = await ethers.getContractFactory(NAME)
    raphTongToken = await RaphTongToken.connect(dev).deploy(owner.address, TOTAL_SUPPLY)
    await raphTongToken.deployed()
  })

  describe("Deployment", function () {
    it('Should has name RaphTongToken', async function () {
      expect(await raphTongToken.name()).to.equal(NAME)
    })

    it('Should has symbol RTT', async function () {
      expect(await raphTongToken.symbol()).to.equal(SYMBOL)
    })

    it('Should be owned by owner', async function () {
      expect(await raphTongToken.owner()).to.equal(owner.address)
    })

    it('Should mint right amount of tokens to the owner', async function () {
      expect(await raphTongToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY)
    })

    /* Spécial car dans le constructor*/
    it('Should emits a Transfer event of the TotalSupply', async function () {
      expect(raphTongToken.deployTransaction).to.emit(raphTongToken, 'Transfered').withArgs(ZERO_ADDRESS, owner.address, TOTAL_SUPPLY)
    })

  })
  describe("Transfer", function () {
    let transaction
    beforeEach(async function () {
      // TOTAL_SUPPLY => Owner to alice 
      transaction = await raphTongToken.connect(owner).transfer(alice.address, TOTAL_SUPPLY)
    })
    it('Should emits Transfer when tranfer token', async function () {
      expect(transaction).to.emit(raphTongToken, 'Transfered').withArgs(owner.address, alice.address, TOTAL_SUPPLY)
    })

    it('Should decrease the balance of the sender', async function () {
      expect(await raphTongToken.balanceOf(owner.address)).to.equal(0)
    })

    it('Should increase the recipient balance', async function () {
      expect(await raphTongToken.balanceOf(alice.address)).to.equal(TOTAL_SUPPLY)
    })

    it('Should revert if balance is insuffisiant', async function () {
      await expect(raphTongToken.connect(owner).transfer(alice.address, TOTAL_SUPPLY)).to.be.revertedWith("RaphTongToken: Insuffisiant balance to tranfer funds.")
    })

    it('Should revert if the recipient is address(0)', async function () {
      // Transfert depuis Alice
      await expect(raphTongToken.connect(alice).transfer(ZERO_ADDRESS, TOTAL_SUPPLY)).to.be.revertedWith("RaphTongToken: Cannot burn token")
    })
  })

  describe("Allowances", function () {
    let allowed

    beforeEach(async function () {
      allowed = await raphTongToken.connect(owner).approve(charlie.address, TOTAL_SUPPLY.div(2))
    })

    it('Should emit an Approved event', async function () {
      expect(allowed).to.emit(raphTongToken, 'Approved').withArgs(owner.address, charlie.address, TOTAL_SUPPLY.div(2))
    })

    it('Should increase the amount allowed', async function () {
      expect(await raphTongToken.connect(charlie).allowance(owner.address)).to.equal(TOTAL_SUPPLY.div(2))
    })
  })

  describe('TransferFrom', function () {
    let transaction
    beforeEach(async function () {
      // BOB transfert la balance de l'owner vers alice
      await raphTongToken.connect(owner).approve(bob.address, TOTAL_SUPPLY.div(2))
      transaction = await raphTongToken.connect(bob).transferFrom(owner.address, alice.address, TOTAL_SUPPLY.div(2))
    })

    it('Should emits Transfer when tranferFrom token', async function () {
      expect(transaction).to.emit(raphTongToken, 'Transfered').withArgs(owner.address, alice.address, TOTAL_SUPPLY.div(2))
    })

    it('Should decrease the balance of the sender', async function () {
      expect(await raphTongToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY.div(2))
    })

    it('Should increase the recipient balance', async function () {
      expect(await raphTongToken.balanceOf(alice.address)).to.equal(TOTAL_SUPPLY.div(ethers.BigNumber.from('2'))) // equivaut .div(2)
    })

    it('Should revert if sender have not enough allowances', async function () {
      await expect(raphTongToken.connect(alice).transferFrom(owner.address, bob.address, TOTAL_SUPPLY.div(10))).to.be.reverted
    })

    it('Should revert if balance is insuffisiant', async function () {
      // charlie (balance 0) approuve bob
      await raphTongToken.connect(charlie).approve(bob.address, TOTAL_SUPPLY.div(2))
      await expect(raphTongToken.connect(bob).transferFrom(charlie.address, alice.address, TOTAL_SUPPLY.div(2))).to.be.revertedWith("RaphTongToken: Insuffisiant balance to tranfer funds.")
    })

    it('Should revert if the recipient is address(0)', async function () {
      // alice (balance TOT/2) appove bob
      await raphTongToken.connect(alice).approve(bob.address, TOTAL_SUPPLY.div(2))
      await expect(raphTongToken.connect(bob).transferFrom(alice.address, ZERO_ADDRESS, TOTAL_SUPPLY.div(2))).to.be.revertedWith("RaphTongToken: Cannot burn token")
    })
  })

  describe('Mint token', function () {
    let mintage
    beforeEach(async function () {
      mintage = await raphTongToken.connect(owner).mint(TOTAL_SUPPLY)
    })

    it('Should emit Minted event', async function () {
      expect(mintage).to.emit(raphTongToken, 'Minted').withArgs(TOTAL_SUPPLY)
    })

    it('Should increase the total supply', async function () {
      expect(await raphTongToken.totalSupply()).to.equal(TOTAL_SUPPLY.mul(2))   //.above(TOTAL_SUPPLY) 
    })

    it('Should revert if the sender is not the owner', async function () {
      await expect(raphTongToken.connect(bob).mint(TOTAL_SUPPLY)).to.be.revertedWith("RaphTongToken: you are not allowed to use this function.")
    })
  })
})
