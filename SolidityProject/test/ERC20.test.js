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

        const ERC20 = await ethers.getContractFactory("ERC20Example");
        const erc20 = await ERC20.deploy();

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
            expect(await erc20.totalSupply()).to.equal(0);
        });

        it("Should set the right balance", async function () {
            const { erc20, owner, otherAccount, addr1, addr2 } =
                await loadFixture(deployERC20Fixture);
            expect(await erc20.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(0)
            );
            expect(await erc20.balanceOf(otherAccount.address)).to.equal(
                ethers.BigNumber.from(0)
            );
            expect(await erc20.balanceOf(addr1.address)).to.equal(
                ethers.BigNumber.from(0)
            );
            expect(await erc20.balanceOf(addr2.address)).to.equal(
                ethers.BigNumber.from(0)
            );
        });
    });

    describe("Mint", function () {
        const amount = ethers.BigNumber.from(13);

        it("increments totalSupply", async function () {
            const { erc20, owner, otherAccount, addr1, addr2 } =
                await loadFixture(deployERC20Fixture);

            await erc20.connect(owner).mint(amount);
            await erc20.connect(otherAccount).mint(ethers.BigNumber.from(16));

            expect(await erc20.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(13)
            );
            expect(await erc20.balanceOf(otherAccount.address)).to.equal(
                ethers.BigNumber.from(16)
            );
            expect(await erc20.balanceOf(addr1.address)).to.equal(
                ethers.BigNumber.from(0)
            );
            expect(await erc20.balanceOf(addr2.address)).to.equal(
                ethers.BigNumber.from(0)
            );

            expect(await erc20.totalSupply()).to.equal(29);
        });
    });

    describe("Transfer", function () {
        describe("transfer success", function () {
            it("transfer", async function () {
                const { erc20, owner, addr1, addr2 } = await loadFixture(
                    deployERC20Fixture
                );

                await erc20.connect(owner).mint(ethers.BigNumber.from(10));
                await erc20.connect(addr1).mint(ethers.BigNumber.from(16));

                await erc20.connect(owner).transfer(addr2.address, 7);
                await erc20.connect(addr1).transfer(addr2.address, 7);

                expect(await erc20.balanceOf(owner.address)).to.equal(3);
                expect(await erc20.balanceOf(addr1.address)).to.equal(9);
                expect(await erc20.balanceOf(addr2.address)).to.equal(14);
            });

            it("should emit Transfer events", async function () {
                const { erc20, owner, addr1, addr2 } = await loadFixture(
                    deployERC20Fixture
                );

                await erc20.connect(owner).mint(ethers.BigNumber.from(10));
                await erc20.connect(addr1).mint(ethers.BigNumber.from(16));

                const tr0 = await erc20
                    .connect(addr1)
                    .transfer(addr2.address, 7);

                await expect(tr0)
                    .to.emit(erc20, "Transfer")
                    .withArgs(addr1.address, addr2.address, 7);

                await expect(erc20.connect(owner).transfer(addr2.address, 8))
                    .to.emit(erc20, "Transfer")
                    .withArgs(owner.address, addr2.address, 8);
            });
        });
    });
});
