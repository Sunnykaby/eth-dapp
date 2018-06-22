const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000 || process.env.PORT;
const Web3 = require('web3');
const truffle_connect = require('./connection/app.js');
const bodyParser = require('body-parser');
const goodsAPI = require('./tools/good');
const shopsAPI = require('./tools/shop');
const fs = require('fs');
const helper = require('./tools/helper');
const utils = require('./tools/util');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//change the tmp upload file dir
// app.use(express.bodyParser({uploadDir:'./tmp'}));//Can't use in Express 4.*
var upload = multer({ dest: 'tmp/' });
// 通过 filename 属性定制
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       cb(null, './tmp');    // 保存的路径，备注：需要自己创建
//   },
//   filename: function (req, file, cb) {
//       // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
//       cb(null, file.fieldname + '-' + Date.now());  
//   }
// });

// 通过 storage 选项来对 上传行为 进行定制化
// var upload = multer(s{ storage: storage })


app.use('/', express.static('public_static'));

/**
 * Get home page data for a visitor
 */
app.get('/homePage', (req, res) =>{
  console.log("**** GET /get HomePage ****");
  var home_hash = req.query.homeHash;
  if(home_hash == "default"){ 
    home_hash = utils.getConfig.home_index;
  }
  //Get the shop list 
  utils.getIndexData(home_hash).then(shops =>{
      res.send(shops);
  });
});

/**
 * Get all accounts of this network
 */
app.get('/getAccounts', (req, res) => {
  console.log("**** GET /getAccounts ****");
  truffle_connect.start(function (answer) {
    res.send(answer);
  })
});

/**
 * Login the app, and set current account
 */
app.post('/login', (req, res) =>{
  utils.setCurrentAccount(req.query.account);
  res.send("success")
});

/**
 * Filter to the account info
 */
app.all('/', (req, res, next)=>{
  if(utils.getCurrentAccout() == ""){
    res.send({"status":1, "err":"Not login, account is needed."})
  }
  else next();
});

/**
 * Get banlance of a target user
 */
app.post('/getBalance', (req, res) => {
  console.log("**** GET /getBalance ****");
  console.log(req.body);
  let currentAcount = req.body.account;
  truffle_connect.refreshBalance(currentAcount, (answer) => {
    let account_balance = answer;
    truffle_connect.start(function (answer) {
      // get list of all accounts and send it along with the response
      let all_accounts = answer;
      response = [account_balance, all_accounts]
      res.send(response);
    });
  });
});

/**
 * Transfer coin from A to B
 */
app.post('/sendCoin', (req, res) => {
  console.log("**** GET /sendCoin ****");
  console.log(req.body);

  let amount = req.body.amount;
  let sender = req.body.sender;
  let receiver = req.body.receiver;

  truffle_connect.sendCoin(amount, sender, receiver, (balance) => {
    res.send(balance);
  });
});

/**
 * Get target user's shop's data
 */
app.get('/shopsIndex', function(req, res){
  var is_Online = req.query.isOnline;
  var shop_hash = req.query.shopHash;
  if(is_Online&&shop_hash==""){
    truffle_connect.getShopBasicFromAddr(utils.getCurrentAccout(), )
  }
  
});

/**
 * Get target user goods data
 */
app.get('/getGoodsList', function(req, res, next){
  var address = req.query.address;
  goodsAPI.getUserGoods(address).then(results =>{
    res.send(results);
  })
});

/**
 * Add a shop
 */
app.post('/addShop', upload.single('banner'), (req, res, next) => {
  console.log(req.body);
  var shopInfo = req.body;
  var shopImgFile = req.file;
  console.log('Eth账号：%s', shopInfo.shopOwn);
  console.log('文件类型：%s', shopImgFile.mimetype);
  console.log('原始文件名：%s', shopImgFile.originalname);
  console.log('文件大小：%s', shopImgFile.size);
  console.log('文件保存路径：%s', shopImgFile.path);
  console.log('文件字段名：%s', shopImgFile.fieldname);
  
  shopsAPI.createShop(shopInfo.shopName, shopInfo.shopOwn, shopImgFile.path, shopInfo.shopDisc)
  .then(hash=>{
    //convert the ipfs hash to eth bytes32
    var eth_hash = helper.ipfsHashToBytes32(hash);
    console.log("Convert to eth hash : " + eth_hash);
    //add The shop into the eth
    truffle_connect.addShop(eth_hash, shopInfo.shopOwn, (status)=>{
      console.log(status);
      res.send({ status: "ok", hashCode:hash, txid:status.tx });
    });
  }).catch(err =>{
    console.log(err);
    res.send({status:"err"});
  });
});

app.post('/addGood', upload.single('goodImg'), (req, res, next) => {
  console.log(req.body);
  var goodInfo = req.body;
  var goodImgFile = req.file;
  console.log('Eth账号：%s', goodInfo.goodOwn);
  console.log('文件类型：%s', goodImgFile.mimetype);
  console.log('原始文件名：%s', goodImgFile.originalname);
  console.log('文件大小：%s', goodImgFile.size);
  console.log('文件保存路径：%s', goodImgFile.path);
  console.log('文件字段名：%s', goodImgFile.fieldname);
  
  goodsAPI.createGood(goodInfo.goodName, goodInfo.goodDisc, goodImgFile.path, 
      goodInfo.goodCatg, goodInfo.goodPrice)
  .then(hash=>{
    //convert the ipfs hash to eth bytes32
    var eth_hash = helper.ipfsHashToBytes32(hash);
    console.log("Convert to eth hash : " + eth_hash);
    //add The good into the eth
    truffle_connect.addGood(eth_hash, goodInfo.goodPrice, goodInfo.goodOwn, (status)=>{
      console.log(status);
      res.send({ status: "ok", hashCode:hash, txid:status.tx });
    });
  }).catch(err =>{
    console.log(err);
    res.send({status:"err"});
  });
});

/**
 * Put the target goods on the sale, save on eth
 */
app.post('putOnSale', (req, res) =>{
  
  var basic_good = req.body.basic_hash;
  var price = req.body.price;
  var reserveNum = req.body.num;
  var shop_hash = req.body.shop_hash;
  shopsAPI.refGood(shop_hash,basic_good,price,reserveNum).then(hash =>{
    var eth_hash = helper.ipfsHashToBytes32(hash);
    truffle_connect.putOnSale(eth_hash, price, reserveNum, utils.getCurrentAccout,(status)=>{
      shopsAPI.exposeShops().then(result_hash =>{
        res.send({ status: "ok", hashCode:hash, newShopsHash: result_hash, txid:status.tx }); 
      });
    });
  });
});


app.post('/getGood', (req, res, next) =>{
  console.log(req.body);
  let currentAcount = req.body.account;
  truffle_connect.getGood(currentAcount, currentAcount, (goodHash)=>{
    console.log("Goodhash form eth " + goodHash);
    var ipfs_hash = helper.bytes32ToIPFSHash(goodHash);
    console.log("IPFS hash : " + ipfs_hash);
    goodsAPI.getGoodByHash(ipfs_hash).then(goodsObject => {
      console.log(goodsObject);
      //load image into the images dir
      res.send({goodObj: goodsObject, goodHash: ipfs_hash});
    });
  });
});

/**
 * Buy good 
 */
app.post('/buyGood', (req, res, next) => {
  console.log(req.body);
  let currentAcount = req.body.account;
  let owner = req.body.owner;
  let goodHash = req.body.goodHash;
  //convert the ipfs hash to eth bytes32
  var eth_hash = helper.ipfsHashToBytes32(goodHash);
  console.log("Convert to eth hash : " + eth_hash);
  truffle_connect.bugGood(owner, eth_hash, currentAcount, function(status){
    console.log(status);
    res.send({status: "Transaction send ok, please check the tx", txid:status.tx});
  });
});

/**
 * Get the transaction from eth
 */
app.post('/getTrans', (req, res, next) =>{
  console.log(req.body);
  let trans = req.body.trans;
  //convert the ipfs hash to eth bytes32
  // var eth_hash = helper.ipfsHashToBytes32(trans);
  // console.log("Convert to eth hash : " + eth_hash);
  var transObj = truffle_connect.web3.eth.getTransaction(trans);
  console.log(transObj);
  res.send(transObj);
  // truffle_connect.getTrans(trans, function(transObj){
  //   console.log(transObj);
  //   res.send({status: "Get Transaction info", tx:transObj});
  // });
});


/***************************** Get the html page ********************************************/



app.get('/goodsListHtml', function(req, res, next){
  var goodList = fs.readFileSync('./public_static/goodList.html', { encoding: 'utf8' });
  res.send(goodList);
});

/**
 * Get target user's shop page
 */
app.get('/shoplistHTML', function(req, res, next){
  var goodList = fs.readFileSync('./public_static/goodList.html', { encoding: 'utf8' });
  res.send(goodList);
});

app.get('/addGoodHtml', function (req, res, next) {
  var addGoodHtml = fs.readFileSync('./public_static/AddGoods.html', { encoding: 'utf8' });
  res.send(addGoodHtml);
});


/********************************  Start server ******************************************************* */

/**
 * Start the http server
 */

app.listen(port, () => {

  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    truffle_connect.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    truffle_connect.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    
  }
  console.log("Express Listening at http://localhost:" + port);

});
