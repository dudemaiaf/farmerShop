pragma solidity ^0.5.0;

contract Farmershop {
    mapping (address => uint) saldos;

    event Purchase(address indexed _buyer, address indexed _seller, uint256 _price);

    constructor() public {
        saldos[tx.origin] = 10000;
    }

    function buy(address farmer, address saver, uint value) public returns(bool sufficient) {
        if(saldos[msg.sender] <= value)
            return false;
        saldos[msg.sender] -= value;
        saldos[farmer] += value;
        emit Purchase(msg.sender, saver, value);
        emit Purchase(saver, farmer, value);
        return true;
    }


    function getSaldo (address addr) public view returns(uint){
        return saldos[addr];
    }
    
}