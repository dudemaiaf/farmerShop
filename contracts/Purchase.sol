pragma solidity ^0.5.0;

contract Purchase {
    address[16] public consumers;

    // purchase a grocerie
    function buy(uint grocerieId) public returns (uint) {
        require(grocerieId >= 0 && grocerieId <= 15);

        consumers[grocerieId] = msg.sender;

        return grocerieId;
    }

    // Retrieving the consumers
    function getConsumers() public view returns (address[16] memory) {
        return consumers;
    }

}