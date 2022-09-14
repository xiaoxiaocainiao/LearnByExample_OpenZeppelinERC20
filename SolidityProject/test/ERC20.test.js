const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("ERC20", function () {
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployERC20Fixture() {
        //console.log("deployERC20Fixture!!!!!!!!!!");

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, addr1, addr2] = await ethers.getSigners();

        const ERC20 = await ethers.getContractFactory("ERC20Mock");
        const erc20 = await ERC20.deploy(
            "YoloToken",
            "YOLO",
            owner.address,
            10
        );

        return { erc20, owner, otherAccount, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should set the right name", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            await expect(await erc20.name()).to.equal("YoloToken");
        });

        it("Should set the right symbol", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            await expect(await erc20.symbol()).to.equal("YOLO");
        });

        it("Should set the right decimals", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            await expect(await erc20.decimals()).to.equal(18);
        });

        it("Should set the right totalSupply", async function () {
            const { erc20 } = await loadFixture(deployERC20Fixture);
            await expect(await erc20.totalSupply()).to.equal(10);
        });

        it("Should set the right balance", async function () {
            const { erc20, owner, otherAccount, addr1, addr2 } =
                await loadFixture(deployERC20Fixture);
            await expect(await erc20.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(10)
            );
            await expect(await erc20.balanceOf(otherAccount.address)).to.equal(
                ethers.BigNumber.from(0)
            );
            await expect(await erc20.balanceOf(addr1.address)).to.equal(
                ethers.BigNumber.from(0)
            );
            await expect(await erc20.balanceOf(addr2.address)).to.equal(
                ethers.BigNumber.from(0)
            );
        });
    });

    describe("Mint", function () {
        const amount = ethers.BigNumber.from(13);

        it("increments totalSupply", async function () {
            const { erc20, owner, otherAccount, addr1, addr2 } =
                await loadFixture(deployERC20Fixture);

            await erc20.mint(owner.address, amount);
            await erc20.mint(otherAccount.address, ethers.BigNumber.from(16));

            await expect(await erc20.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(23)
            );
            await expect(await erc20.balanceOf(otherAccount.address)).to.equal(
                ethers.BigNumber.from(16)
            );
            await expect(await erc20.balanceOf(addr1.address)).to.equal(
                ethers.BigNumber.from(0)
            );
            await expect(await erc20.balanceOf(addr2.address)).to.equal(
                ethers.BigNumber.from(0)
            );

            await expect(await erc20.totalSupply()).to.equal(39);
        });
    });

    describe("Transfer", function () {
        describe("transfer success", function () {
            it("transfer", async function () {
                const { erc20, owner, addr1, addr2 } = await loadFixture(
                    deployERC20Fixture
                );

                await erc20.mint(owner.address, ethers.BigNumber.from(10));
                await erc20.mint(addr1.address, ethers.BigNumber.from(16));

                await erc20.transferInternal(owner.address, addr2.address, 7);
                await erc20.transferInternal(addr1.address, addr2.address, 7);

                await expect(await erc20.balanceOf(owner.address)).to.equal(13);
                await expect(await erc20.balanceOf(addr1.address)).to.equal(9);
                await expect(await erc20.balanceOf(addr2.address)).to.equal(14);
            });

            it("should emit Transfer events", async function () {
                const { erc20, owner, addr1, addr2 } = await loadFixture(
                    deployERC20Fixture
                );

                await erc20.mint(owner.address, ethers.BigNumber.from(10));
                await erc20.mint(addr1.address, ethers.BigNumber.from(16));

                const tr0 = erc20.transferInternal(
                    owner.address,
                    addr2.address,
                    7
                );

                await expect(tr0)
                    .to.emit(erc20, "Transfer")
                    .withArgs(owner.address, addr2.address, 7);

                await expect(
                    erc20.transferInternal(addr1.address, addr2.address, 8)
                )
                    .to.emit(erc20, "Transfer")
                    .withArgs(addr1.address, addr2.address, 8);
            });
        });

        describe("transfer fail", function () {
            it("transfer amount exceeds balance", async function () {
                const { erc20, addr1, addr2 } = await loadFixture(
                    deployERC20Fixture
                );

                await erc20.mint(addr1.address, ethers.BigNumber.from(16));

                const tr0 = erc20.transferInternal(
                    addr1.address,
                    addr2.address,
                    17
                );

                await expect(tr0).to.be.revertedWith(
                    "ERC20: transfer amount exceeds balance"
                );
            });
        });
    });

    describe("Approval", function () {
        it("approveInternal", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            //第一个参数是owner, 第二个参数是spender(挥霍的人)
            await erc20.approveInternal(
                owner.address,
                addr1.address,
                ethers.BigNumber.from(2)
            );
            await expect(
                await erc20.allowance(owner.address, addr1.address)
            ).to.equal(2);
            await expect(
                await erc20.allowance(addr1.address, owner.address)
            ).to.equal(0);
        });

        it("approve", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            //第一个参数是owner, 第二个参数是spender(挥霍的人)
            await erc20
                .connect(owner)
                .approve(addr1.address, ethers.BigNumber.from(3));
            await erc20
                .connect(owner)
                .approve(addr1.address, ethers.BigNumber.from(4));
            await expect(
                await erc20.allowance(owner.address, addr1.address)
            ).to.equal(4);
            await expect(
                await erc20.allowance(addr1.address, owner.address)
            ).to.equal(0);
        });

        it("approve emit event 1", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            const ap0 = await erc20
                .connect(owner)
                .approve(addr1.address, ethers.BigNumber.from(4));
            await expect(ap0)
                .to.emit(erc20, "Approval")
                .withArgs(owner.address, addr1.address, 4);
        });

        it("approve emit event 2", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            const ap0 = await erc20
                .connect(owner)
                .approve(addr1.address, ethers.BigNumber.from(22));
            await expect(ap0)
                .to.emit(erc20, "Approval")
                .withArgs(owner.address, addr1.address, 22);
        });
    });

    describe("transferFrom", function () {
        it("transferFrom success", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            await erc20.mint(addr1.address, ethers.BigNumber.from(30));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(12));
            await erc20.transferFrom(addr1.address, owner.address, 10);
            await erc20.transferFrom(addr1.address, owner.address, 2);
        });

        it("transferFrom success with event", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            await erc20.mint(addr1.address, ethers.BigNumber.from(30));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(12));
            const tr0 = erc20.transferFrom(addr1.address, owner.address, 10);
            await expect(tr0)
                .to.emit(erc20, "Transfer")
                .withArgs(addr1.address, owner.address, 10);
            await erc20.transferFrom(addr1.address, owner.address, 2);
        });

        it("transferFrom failed 1", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            await erc20.mint(addr1.address, ethers.BigNumber.from(30));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(12));
            //await erc20.transferFrom(addr1.address, owner.address, 10);
            const tr0 = erc20.transferFrom(addr1.address, owner.address, 15);
            await expect(tr0).to.be.revertedWith(
                "ERC20: insufficient allowance"
            );
        });

        it("transferFrom failed 2", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            await erc20.mint(addr1.address, ethers.BigNumber.from(30));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(12));
            await erc20.transferFrom(addr1.address, owner.address, 10);
            const tr0 = erc20.transferFrom(addr1.address, owner.address, 3);
            await expect(tr0).to.be.revertedWith(
                "ERC20: insufficient allowance"
            );
        });

        it("transferFrom failed 3. approve will not!!! be added.", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            await erc20.mint(addr1.address, ethers.BigNumber.from(30));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(12));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(8));
            const tr0 = erc20.transferFrom(addr1.address, owner.address, 9);
            await expect(tr0).to.be.revertedWith(
                "ERC20: insufficient allowance"
            );
        });
    });

    describe("increaseAllowance", function () {
        it("increaseAllowance approve will be added.", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            await erc20.mint(addr1.address, ethers.BigNumber.from(30));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(12));
            const in0 = erc20
                .connect(addr1)
                .increaseAllowance(owner.address, ethers.BigNumber.from(8));
            await expect(in0)
                .to.emit(erc20, "Approval")
                .withArgs(addr1.address, owner.address, 20);

            await expect(
                await erc20.allowance(addr1.address, owner.address)
            ).to.equal(20);

            const tr0 = erc20.transferFrom(addr1.address, owner.address, 20);
            await expect(tr0)
                .to.emit(erc20, "Transfer")
                .withArgs(addr1.address, owner.address, 20);
        });
    });

    describe("decreaseAllowance", function () {
        it("decreaseAllowance approve will be subtracted 1", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            await erc20.mint(addr1.address, ethers.BigNumber.from(30));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(25));
            await erc20
                .connect(addr1)
                .decreaseAllowance(owner.address, ethers.BigNumber.from(5));

            await expect(
                await erc20.allowance(addr1.address, owner.address)
            ).to.equal(20);

            const tr0 = erc20.transferFrom(addr1.address, owner.address, 20);
            await expect(tr0)
                .to.emit(erc20, "Transfer")
                .withArgs(addr1.address, owner.address, 20);
        });

        it("decreaseAllowance approve will be subtracted 2", async function () {
            const { erc20, owner, addr1 } = await loadFixture(
                deployERC20Fixture
            );

            await erc20.mint(addr1.address, ethers.BigNumber.from(30));
            await erc20
                .connect(addr1)
                .approve(owner.address, ethers.BigNumber.from(25));
            await erc20
                .connect(addr1)
                .decreaseAllowance(owner.address, ethers.BigNumber.from(5));

            await expect(
                await erc20.allowance(addr1.address, owner.address)
            ).to.equal(20);

            const tr0 = erc20.transferFrom(addr1.address, owner.address, 21);
            await expect(tr0).to.be.revertedWith(
                "ERC20: insufficient allowance"
            );
        });
    });
});
