// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@thirdweb-dev/contracts/extension/ProxyForUpgradeable.sol";

contract ProxyForGame is ProxyForUpgradeable {
    constructor(address _logic, bytes memory _data) payable ProxyForUpgradeable(_logic, _data) {}
}