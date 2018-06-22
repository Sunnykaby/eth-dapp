const contract = require('truffle-contract');

// const metacoin_artifact = require('../build/contracts/MetaCoin.json');
const goodshop_artifact = require('../build/contracts/GoodShop.json')
// var MetaCoin = contract(metacoin_artifact);
var GoodShop = contract(goodshop_artifact);

var curAccount = "";
module.exports = {
  start: function (callback) {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    GoodShop.setProvider(self.web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    self.web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }
      self.accounts = accs;
      self.account = self.accounts[2];

      callback(self.accounts);
    });
  },
  refreshBalance: function (account, callback) {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    GoodShop.setProvider(self.web3.currentProvider);

    var meta;
    GoodShop.deployed().then(function (instance) {
      meta = instance;
      return meta.getBalance.call(account, { from: account });
    }).then(function (value) {
      callback(value.valueOf());
    }).catch(function (e) {
      console.log(e);
      callback("Error 404");
    });
  },
  sendCoin: function (amount, sender, receiver, callback) {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    GoodShop.setProvider(self.web3.currentProvider);

    var meta;
    GoodShop.deployed().then(function (instance) {
      meta = instance;
      return meta.sendCoin(receiver, amount, { from: sender });
    }).then(function () {
      self.refreshBalance(sender, function (answer) {
        callback(answer);
      });
    }).catch(function (e) {
      console.log(e);
      callback("ERROR 404");
    });
  },
  putOnSale: function (goodHash, price, num, sender, callback) {
    var self = this;
    GoodShop.setProvider(self.web3.currentProvider);
    var meta;
    GoodShop.deployed().then(function (instance) {
      meta = instance;
      return meta.putOnSale(goodHash, price, num, { from: sender });
    }).then(status => {
      console.log(status)
      callback(status);
    }).catch(function (e) {
      console.log(e);
      callback("ADD Goods error," + e.toString());
    });
  },
  checkGoodNum: function (goodHash, sender, callback) {
    var self = this;
    GoodShop.setProvider(self.web3.currentProvider);
    var meta;
    GoodShop.deployed().then(function (instance) {
      meta = instance;
      return meta.checkGoodNum(goodHash, { from: sender });
    }).then(num => {
      console.log(num);
      callback(num);
    }).catch(function (e) {
      console.log(e);
      callback("ADD Goods error," + e.toString());
    });
  },

  checkGoodPrice: function (goodHash, sender, callback) {
    var self = this;
    GoodShop.setProvider(self.web3.currentProvider);
    var meta;
    GoodShop.deployed().then(function (instance) {
      meta = instance;
      return meta.checkGoodPrice(goodHash, { from: sender });
    }).then(price => {
      console.log(price);
      callback(price);
    }).catch(function (e) {
      console.log(e);
      callback("ADD Goods error," + e.toString());
    });
  },

  getShopBasicFromAddr: function (sender, callback) {
    var self = this;
    GoodShop.setProvider(self.web3.currentProvider);
    var meta;
    GoodShop.deployed().then(function (instance) {
      meta = instance;
      return meta.getShopBasicFromAddr({ from: sender });
    }).then(shop_hash => {
      console.log(shop_hash);
      callback(shop_hash);
    }).catch(function (e) {
      console.log(e);
      callback("ADD Goods error," + e.toString());
    });
  },

  checkShopHash: function (shop_hash, sender, callback) {
    var self = this;
    GoodShop.setProvider(self.web3.currentProvider);
    var meta;
    GoodShop.deployed().then(function (instance) {
      meta = instance;
      return meta.checkGoodPrice(shop_hash, { from: sender });
    }).then(status => {
      console.log(status);
      callback(status);
    }).catch(function (e) {
      console.log(e);
      callback("ADD Goods error," + e.toString());
    });
  },

  bugGood: function (_from, goodHash, account, callback) {
    var self = this;
    GoodShop.setProvider(self.web3.currentProvider);
    var meta;
    GoodShop.deployed().then(function (instance) {
      meta = instance;
      return meta.buyGood(_from, goodHash, { from: account });
    }).then(status => {
      console.log(status);
      callback(status);
    }).catch(function (e) {
      console.log(e);
      callback("ADD Goods error," + e.toString());
    });
  },

  getTrans: function (transaction, callback) {
    var self = this;
    console.log(transaction);
    GoodShop.setProvider(self.web3.currentProvider);
    var transObj = GoodShop.eth.getTransaction(transaction);
    console.log(transObj);
    // var meta;
    // GoodShop.deployed().then(function(instance){
    //   meta = instance;
    //   return self.web3.eth.getTransaction(transaction, callback);
    // }).then(tranObj => {
    //   console.log(tranObj);
    //   callback(tranObj);
    // }).catch(function(e){
    //   console.log(e);
    //   callback("Get Transaction error," + e.toString());
    // });
  }
}
