pragma solidity ^0.4.17;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract GoodShop {
    //Note: Consider that here each good just have one
    //TODO: good should be more num
    mapping (address => bytes32) goodsList;
	mapping (address => uint) balances;
	mapping (bytes32 => uint) goodPrice;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	function GoodShop() public {
		balances[msg.sender] = 10000000;
	}
	
	function addGoodToAddr(bytes32 goodHash, uint price) public returns(bool sufficient) {
	    address owner = msg.sender;
	    goodsList[owner] = goodHash;
	    goodPrice[goodHash] = price;
	   // if(goodsList[owner].length > 0){
	   //    if(goodPrice[goodHash] != 0 && goodPrice[goodHash]==price) return false; 
	   // }
	   // else{
	   //     goodsList[owner] = goodHash;
	   // }
	   // goodPrice[goodHash] = price;
	    return true;
	}   
	
	function getGoodFromAddr(address _own) public view returns(bytes32){
	    return goodsList[_own];
	}
	
	function getGoodPrice(bytes32 goodHash) public view returns(uint){
	    return goodPrice[goodHash];
	}
	
	function buyGood(address _from, bytes32 goodHash) public returns(bool isSuccess){
	    address buyer = msg.sender;
	    if(buyer == _from) return false;
	    //get good price
	    uint price = goodPrice[goodHash];
	    if (balances[buyer] < price) return false;
		balances[buyer] -= price;
		balances[_from] += price;
	    goodsList[buyer] = goodHash;
		goodsList[_from] = bytes32(0);//maybe some better method?
		Transfer(_from, buyer, price);
		return true;
	}

	function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		Transfer(msg.sender, receiver, amount);
		return true;
	}

	function getBalanceInEth(address addr) public view returns(uint){
		return ConvertLib.convert(getBalance(addr),2);
	}

	function getBalance(address addr) public view returns(uint) {
		return balances[addr];
	}
}
