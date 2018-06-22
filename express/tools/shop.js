var fs = require("fs")
var path = require('path')
var ipfsAPI = require("./ipfsAPI")
var shopObj = require("../storage/shops.json")
var shopIndexObj = require("../storage/shops_index.json")
var shopGoods = require('../storage/shop_goods.json')
var goodIPFS = require('./good');

/**
 * Add shop hash and info into the cache, total shops in network
 * @param {*} shop 
 */
var addShop = function (shop) {
    if (shopObj.shopHash.indexOf(shop.hash) == -1) {
        shopObj.shops.push(shop);
        shopObj.shopHash.push(shop.hash);
    }
    if (shopIndexObj.shopHash.indexOf(shop.hash) == -1) {
        shopIndexObj.shops.push(shop);
        shopIndexObj.shopHash.push(shop.hash);
    }
}

/**
 * Add shop basic info into DB. total shops in network
 */
var presistShops = function () {
    var basePath = path.join(__dirname, '../storage/shops.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(shopObj));
    basePath = path.join(__dirname, '../storage/shops_index.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(shopIndexObj));
}

/**
 * Create the target shop goods container
 * @param {*} shopHash 
 */
var createGoodsContainer = function (shopHash) {
    var basePath = path.join(__dirname, '../storage/', shopHash, '_basic_goods.json');
    var basic_goods = { "shop": shopHash, "goods": [] }
    fs.writeFileSync(basePath, JSON.stringify(basic_goods));
    basePath = path.join(__dirname, '../storage/', shopHash, '_sale_goods.json');
    fs.writeFileSync(basePath, JSON.stringify(basic_goods));
}

/**
 * Create shop basic info
 * @param {*} name 
 * @param {*} shopOwner 
 * @param {*} bannerPath 
 * @param {*} disc 
 */
module.exports.createShop = function (name, shopOwner, bannerPath, disc) {
    var newS;
    //First, push the image to ipfs and get the hash
    var imgBuff = Buffer.from(fs.readFileSync(bannerPath));
    return ipfsAPI.add(imgBuff).then((hash) => {
        console.log("Shops img upload to ipfs : " + hash);
        console.log("http://localhost:8080/ipfs/" + hash);
        //Second, create shopHash
        newS.name = name;
        newS.descripthion = disc;
        newS.banner = hash;
        //Check the name is exist?
        return ipfsAPI.add(Buffer.from(JSON.stringify(newS)));
    }).then(hash => {
        console.log("Shop upload to ipfs : " + hash);
        console.log("http://localhost:8080/ipfs/" + hash);
        //Laod into the goods json
        newS.hash = hash;
        addShop(newS);
        presistShops();
        createGoodsContainer(newS.hash)
        return Promise.resolve(hash);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    })
}

/**
 * Add good obj into the cache, relate the shop hash
 * @param {*} good 
 * @param {*} shopHash 
 */
var addGoodToShop = function (good, shopHash) {
    //Add into target shop cahce
    var basePath = path.join(__dirname,'../storage/',shopHash,'_sale_goods.json');
    var sale_goods = JSON.parse(fs.readFileSync(basePath));
    
    //Add into the total cache
    if (!shopGoods.hasOwnProperty(shopHash)) {
        shopGoods[shopHash] = [];
    }
    shopGoods[shopHash].push(good);
}

/**
 * Put the goods obj - shop hash related 
 */
var presistShopGoods = function () {
    var basePath = path.join(__dirname, '../storage/shop_goods.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(shopGoods));
}

/**
 * Expose the shophash - goods related data as a ipfs hash
 */
module.exports.exposeShops = function(){
    return ipfsAPI.add(Buffer.from(JSON.stringify(shopGoods))).then(hash =>{
        return Promise.resolve(hash);
    })
}

var presistSaleGoods = function(shopHash) {
    var basePath = path.join(__dirname,'../storage/',shopHash,'_sale_goods.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(goodObj));
}

/**
 * Add a good to target shop
 * @param {*} shopHash 
 * @param {*} goodBasicHash 
 * @param {*} price 
 * @param {*} reserveNum 
 */
module.exports.refGood = function (shopHash, goodBasicHash, price, reserveNum) {
    var newS = {};
    newS.basicHash = goodBasicHash;
    newS.shopHash = shopHash;
    newS.price = price;
    newS.reserveNum = reserveNum;
    //Check the name is exist?
    return ipfsAPI.add(Buffer.from(JSON.stringify(newS))).then(hash => {
        console.log("Shop upload to ipfs : " + hash);
        console.log("http://localhost:8080/ipfs/" + hash);
        //Laod into the goods json
        newS.hash = hash;
        addGoodToShop(newS, shopHash);
        presistShopGoods();
        goodIPFS.presistSaleGoods(shopHash)
        return Promise.resolve(hash);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    })
}

/**
 * Get shop basic info from hash
 * @param {*} hash 
 */
module.exports.getShopByHash = function (hash) {
    return ipfsAPI.get(hash).then((buff) => {
        let shop = JSON.parse(buff.toString('utf-8'))
        console.log(shop);
        return Promise.resolve(shop);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    })
}