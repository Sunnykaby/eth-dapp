pragma solidity ^0.4.17;

import "./ConvertLib.sol";

contract GoodShop {
    
    struct Good_pro{
        int num;
        int price;
        bool isOnSale;
    }
    
    struct Shop{
        // address owner;
        mapping (bytes32 => Good_pro) good_store;// good_basic_hash => good
        bool status;
    }
    
    mapping (address => bytes32) shop_map;//add => shop_hash
    
    mapping (address => Shop) shops; // shop_hash => shop 
	mapping (address => int) balances;

    //Transfer money from A to B
	event Transfer(address indexed _from, address indexed _to, int _value);
	event GoodOnSale(bytes32 good_basic_hash);

	function GoodShop() public {
		balances[msg.sender] = 10000000;
	}
	
	function createShop(bytes32 shop_basic)public returns(bool sufficient){
	     address owner = msg.sender;
	     if(shops[owner].status == false){
	        shop_map[owner] = shop_basic;
	        shops[owner].status = true;
	     }
	     else return false;
	}
	
	
	function putOnSale(bytes32 goodHash, int price, int num) public returns(bool sufficient) {
	    address owner = msg.sender;
	    if(shops[owner].status == true){
	        mapping (bytes32 => Good_pro) good = shops[owner].good_store;
	        if(good[goodHash].isOnSale) return false;
	        good[goodHash].price = price;
	        good[goodHash].num = num;
	        good[goodHash].isOnSale = true;
	        GoodOnSale(goodHash);
	     }
	     else return false;
	}   
	
	function checkGoodNum(bytes32 goodHash) public view returns(int num){
	    address owner = msg.sender;
	    if(shops[owner].status == true){
	        mapping (bytes32 => Good_pro) good = shops[owner].good_store;
	        return good[goodHash].num;
	    }
	}
	
	function checkGoodPrice(bytes32 goodHash) public view returns(int price){
	    address owner = msg.sender;
	    if(shops[owner].status == true){
	        mapping (bytes32 => Good_pro) good = shops[owner].good_store;
	        return good[goodHash].price;
	    }
	}
	
	function getShopBasicFromAddr() public view returns(bytes32 shop_basic){
	    address _own = msg.sender;
	    return shop_map[_own];
	}
	
	function checkShopHash(bytes32 shop_basic) public view returns(bool sufficient){
	    if(shops[msg.sender].status && shop_map[msg.sender] == shop_basic) return true;
	    else return false;
	}
	
	
	function buyGood(address _from, bytes32 goodHash) public returns(bool isSuccess){
	    address buyer = msg.sender;
	    if(buyer == _from) return false;
	    //Get good
	    Shop shop_cur = shops[_from];
	    Good_pro good = shop_cur.good_store[goodHash];
	    if(good.num <= 0 || balances[buyer] < good.price) return false;
		balances[buyer] -= good.price;
		balances[_from] += good.price;
		if(good.num > 1) good.num = good.num -1;
		else good.num = -1;
		Transfer(_from, buyer, good.price);
		return true;
	}

	function sendCoin(address receiver, int amount) public returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		Transfer(msg.sender, receiver, amount);
		return true;
	}


	function getBalance(address addr) public view returns(int balance) {
		return balances[addr];
	}
}
