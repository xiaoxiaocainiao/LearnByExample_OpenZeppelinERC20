const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("ERC20", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployERC20Fixture() {
        const ONE_GWEI = 1_000_000_000;
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const ERC20 = await ethers.getContractFactory("ERC20Mock");
        const erc20 = await ERC20.deploy("YoloToken", "YOLO", owner.address, ethers.BigNumber.from(10));

        return { erc20, owner, otherAccount };
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
    });
});
