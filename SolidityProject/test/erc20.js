const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("ERC20", function () {
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployERC20Fixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, addr1, addr2] = await ethers.getSigners();

        const ERC20 = await ethers.getContractFactory("ERC20Mock");
        const erc20 = await ERC20.deploy(
            "YoloToken",
            "YOLO",
            owner.address,
            ethers.BigNumber.from(10)
        );

        console.log("deployERC20Fixture!!!!!!!!!!");

        return { erc20, owner, otherAccount, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should set the right name", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            expect(await erc20.name()).to.equal("YoloToken");
        });

        it("Should set the right symbol", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            expect(await erc20.symbol()).to.equal("YOLO");
        });

        it("Should set the right decimals", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            expect(await erc20.decimals()).to.equal(18);
        });

        it("Should set the right totalSupply", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            expect(await erc20.totalSupply()).to.equal(10);
        });

        it("Should set the right balance", async function () {
            const { erc20, owner, otherAccount } = await loadFixture(
                deployERC20Fixture
            );
            expect(await erc20.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(10)
            );
            expect(await erc20.balanceOf(otherAccount.address)).to.equal(
                ethers.BigNumber.from(0)
            );
        });
    });

    describe("Mint", function () {
        const amount = ethers.BigNumber.from(13);

        it("rejects a null account, should revert", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            await expect(erc20.mint(ZERO_ADDRESS, 50)).to.be.revertedWith(
                "ERC20: mint to the zero address"
            );
        });

        describe("for a non zero account", function () {
            it("increments totalSupply", async function () {
                const { erc20, owner, otherAccount } = await loadFixture(
                    deployERC20Fixture
                );
                await erc20.mint(otherAccount.address, amount);
                await erc20.mint(owner.address, ethers.BigNumber.from(16));

                expect(await erc20.totalSupply()).to.equal(39);
                expect(await erc20.balanceOf(owner.address)).to.equal(
                    ethers.BigNumber.from(26)
                );
                expect(await erc20.balanceOf(otherAccount.address)).to.equal(
                    ethers.BigNumber.from(13)
                );
            });
        });
    });

    
});
