// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../token/ERC20/ERC20.sol";
import "hardhat/console.sol";

// mock class using ERC20
contract ERC20Example is ERC20 {
    constructor() ERC20("YoloToken", "YOLO") {}

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    function approve(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal view override {
        console.log("Transferring from %s to %s %s tokens", from, to, amount);
    }
}
