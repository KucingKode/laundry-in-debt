// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@thirdweb-dev/contracts/extension/Upgradeable.sol";

import "@thirdweb-dev/contracts/prebuilts/drop/DropERC1155.sol";
import "@thirdweb-dev/contracts/prebuilts/token/TokenERC20.sol";
import "@thirdweb-dev/contracts/external-deps/openzeppelin/utils/ERC1155/ERC1155Holder.sol";

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract Game is Upgradeable, Initializable, ERC1155Holder, ReentrancyGuardUpgradeable {
    uint256 private constant DECIMALS = 1_000_000_000_000_000_000;
    uint32 private constant ONE_DAY = 86400;
    uint32 private constant ONE_OCLOCK = 46800;

    DropERC1155 public machineNftCollection;
    TokenERC20 public gameToken;
    address public owner;

    uint256 public expenseMult = DECIMALS * 14/10;
    uint256 public initialExpense = DECIMALS * 5/100;
    uint256 public clockMultiplier = 10;
    uint256 public priceFactorChange = DECIMALS * 3/1000;
    uint256 public minFactorChange = DECIMALS * 10/100;

	function initialize(
        DropERC1155 machineContractAddress,
        TokenERC20 tokenContractAddress
    ) external initializer {
        machineNftCollection = machineContractAddress;
        gameToken = tokenContractAddress;
		owner = msg.sender;
	}

	function _authorizeUpgrade(address) internal view override {
		require(msg.sender == owner);
	}

    // Laundromat
    struct MachineData {
        bool isValue;
        uint256 income;
    }

    struct PlayerData {
        bool isValue;
        uint256 debt;
        uint256 balance;
        uint256 expense;
        uint256 income;
        uint256 lastUpdate;
        uint256 machineCount;
        mapping(uint64 => uint16) machines;
    }

    struct MarketItem {
        bool isValue;
        uint256 basePrice;
        uint256 priceFactor;
        uint32 amount;
    }

    mapping(address => PlayerData) public players;
    mapping(uint16 => MachineData) public machineData;
    mapping(uint16 => MarketItem) public marketItems;

    // -------------- owner-only methods ---------------
    function setMachineIncome(uint16 tokenId, uint72 income) external nonReentrant {
        require(msg.sender == owner, "only owner allowed to access");
        machineData[tokenId].isValue = true;
        machineData[tokenId].income = income;
    }

    function setItemBasePrice(uint16 tokenId, uint256 price) external nonReentrant {
        require(msg.sender == owner, "only owner allowed to access");
        _ensureMarketItem(tokenId);
        marketItems[tokenId].basePrice = price;
    }

    function destroySmartContract(address payable to) external {
        require(msg.sender == owner, "only owner allowed to access");
        selfdestruct(to);
    }

    function returnMachine(uint16 tokenId, uint256 amount) external nonReentrant {
        require(msg.sender == owner, "only owner allowed to access");
        machineNftCollection.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
    }

    function returnTokens(uint256 amount) external nonReentrant {
        require(msg.sender == owner, "only owner allowed to access");
        gameToken.transfer(msg.sender, amount);
    }

    function stockMachine(uint16 tokenId, uint32 amount) external nonReentrant {
        require(msg.sender == owner, "only owner allowed to access");
        require(machineNftCollection.balanceOf(msg.sender, tokenId) >= amount, "insufficient token amount");

        _ensureMarketItem(tokenId);
        machineNftCollection.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            ""
        );

        marketItems[tokenId].amount += amount;
    }

    // ------ public methods --------

    // get sender's staked machine with pos
    function getMachine(address player, uint64 pos) public view returns (uint16) {
        return players[player].machines[pos];
    }

    // create new player data
    function createPlayer() external nonReentrant {
        if (players[msg.sender].isValue) return;

        players[msg.sender].isValue = true;
        players[msg.sender].debt = 0;
        players[msg.sender].balance = 100 * DECIMALS;
        players[msg.sender].expense = 0;
        players[msg.sender].income = 0;
        players[msg.sender].machineCount = 0;
        players[msg.sender].lastUpdate = block.timestamp;
    }

    // deposit token to contract
    function deposit(uint256 amount) external nonReentrant {
        require(players[msg.sender].isValue, "player not created");
        require(gameToken.balanceOf(msg.sender) >= amount, "amount exceeds balance");

        gameToken.transferFrom(msg.sender, address(this), amount);
        players[msg.sender].balance += amount;
        _updateBalance(msg.sender);
    }

    // withdraw token from contract
    function withdraw(uint256 amount) external nonReentrant {
        require(players[msg.sender].isValue, "player not created");

        _updateBalance(msg.sender);

        require(players[msg.sender].balance >= amount, "amount exceeds balance");

        gameToken.transfer(msg.sender, amount);
        players[msg.sender].debt += amount;
    }

    // stake owned machine NFT
    function stakeMachine(uint16 tokenId, uint64 pos) external nonReentrant {
        require(players[msg.sender].isValue, "player not created");
        require(machineNftCollection.balanceOf(msg.sender, tokenId) > 0, "token not owned");
        require(tokenId > 0, "invalid token");
        require(machineData[tokenId].income > 0, "invalid token");

        _updateBalance(msg.sender);

        // machine already exist in pos
        if (players[msg.sender].machines[pos] > 0) {
            uint16 oldTokenId = players[msg.sender].machines[pos];

            // return old machine
            machineNftCollection.safeTransferFrom(
                address(this),
                msg.sender,
                oldTokenId,
                1,
                "returning staked machine"
            );

            players[msg.sender].income -= machineData[oldTokenId].income;
            players[msg.sender].machineCount--;
        }

        // stake new machine
        machineNftCollection.safeTransferFrom(msg.sender, address(this), tokenId, 1, "staking machine");

        players[msg.sender].machines[pos] = tokenId;
        players[msg.sender].income += machineData[tokenId].income;
        players[msg.sender].machineCount++;

        // update expense
        if (players[msg.sender].machineCount == 1) {
            players[msg.sender].expense = initialExpense;
        } else {
            players[msg.sender].expense = players[msg.sender].expense * expenseMult / DECIMALS;
        }
    }

    // unstake staked machine NFT
    function unstakeMachine(uint64 pos) external nonReentrant {
        require(players[msg.sender].isValue, "player not created");
        require(players[msg.sender].machines[pos] > 0, "no token staked at position");

        uint16 tokenId = players[msg.sender].machines[pos];

        _updateBalance(msg.sender);

        // unstake machine
        machineNftCollection.safeTransferFrom(address(this), msg.sender, tokenId, 1, "returning machine");
        
        players[msg.sender].machineCount--;
        players[msg.sender].income -= machineData[tokenId].income;
        delete players[msg.sender].machines[pos];

        // update expense
        if (players[msg.sender].machineCount == 0) {
            players[msg.sender].expense = 0;
        } else {
            players[msg.sender].expense = players[msg.sender].expense / expenseMult * DECIMALS;
        }
    }

    // --------- Machine market methods -----------
    // add player's debt & send machine NFT to sender
    function buyMachine(uint16 tokenId, uint256 bid) external nonReentrant {
        require(players[msg.sender].isValue, "player not created");
        require(players[msg.sender].isValue, "not enough balance");
        require(players[msg.sender].balance >= bid, "not enough balance");
        require(marketItems[tokenId].basePrice > 0, "token not in market");
        require(marketItems[tokenId].amount > 0, "out of stock");

        uint256 price = marketItems[tokenId].basePrice;
        require(bid >= price, "price changed");

        // transaction
        players[msg.sender].debt += bid;
        machineNftCollection.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            1,
            "buying machine"
        );

        // update data
        marketItems[tokenId].amount--;
        marketItems[tokenId].priceFactor += priceFactorChange;
    }

    // receive machine NFT & add player's balance to sender
    function sellMachine(uint16 tokenId, uint256 ask) external nonReentrant {
        require(players[msg.sender].isValue, "player not created");
        require(machineNftCollection.balanceOf(msg.sender, tokenId) > 0, "token not owned");
        require(marketItems[tokenId].isValue, "token not in market");

        // calc discounted price
        uint256 price = marketItems[tokenId].basePrice * marketItems[tokenId].priceFactor / DECIMALS;
        require(ask <= price, "price changed");  

        // transaction
        players[msg.sender].balance += ask;
        machineNftCollection.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            1,
            "selling machine"
        );

        // update data
        marketItems[tokenId].amount++;
        marketItems[tokenId].priceFactor -= priceFactorChange;
    
        if (marketItems[tokenId].priceFactor < minFactorChange)
            marketItems[tokenId].priceFactor = minFactorChange;
    }

    // ----- utils ----------
    function _updateBalance(address player) internal {
        uint256 multNow = block.timestamp * clockMultiplier;
        uint256 multLast = players[player].lastUpdate * clockMultiplier;
        
        uint256 days0 = multLast / ONE_DAY;
        uint256 days1 = multNow / ONE_DAY;
        uint256 hour = multNow % ONE_DAY;
        
        uint256 timeDiff = multNow - multLast;
        uint256 paymentCount = days1 - days0;
        if (hour >= ONE_OCLOCK) paymentCount++;

        // calc total i e
        uint256 income = timeDiff * players[player].income;
        uint256 expense = paymentCount * ONE_DAY * players[player].expense;

        // update balance & debt
        players[player].balance += income;
        players[player].debt += expense;
        
        // simplify balance & debt
        if (players[player].balance > players[player].debt) {
            players[player].balance = players[player].balance - players[player].debt;
            players[player].debt = 0;
        } else {
            players[player].debt = players[player].debt - players[player].balance;
            players[player].balance = 0;
        }

        players[player].lastUpdate = block.timestamp;
    }

    function _ensureMarketItem(uint16 tokenId) internal {
        if (marketItems[tokenId].isValue) return;

        marketItems[tokenId].isValue = true;
        marketItems[tokenId].priceFactor = DECIMALS * 6/10;
        marketItems[tokenId].amount = 0;
    }
}