var fs = require("fs")
var path = require('path')
var ipfsAPI = require("./ipfsAPI")
var shopObj = require("../storage/shops.json")
var shopIndexObj = require("../storage/shops_index.json")
var shopGoods = require('../storage/shop_goods.json')
var goodIPFS = require('./good')



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

var addGoodToShop = function (goodHash, shopHash) {
    if (!shopGoods.hasOwnProperty(shopHash)) {
        shopGoods[shopHash] = [];
    }
    shopGoods[shopHash].push(goodHash);
}

var presistShops = function () {
    var basePath = path.join(__dirname, '../storage/shops.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(shopObj));
    basePath = path.join(__dirname, '../storage/shops_index.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(shopIndexObj));
}

var presistShopGoods = function () {
    var basePath = path.join(__dirname, '../storage/shop_goods.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(shopGoods));
}

var createGoodsContainer = function (shopHash) {
    var basePath = path.join(__dirname, '../storage/', shopHash, '_basic_goods.json');
    var basic_goods = { "shop": shopHash, "goods": [] }
    fs.writeFileSync(basePath, JSON.stringify(basic_goods));
    basePath = path.join(__dirname, '../storage/', shopHash, '_sale_goods.json');
    fs.writeFileSync(basePath, JSON.stringify(basic_goods));
}


module.exports.getShopIndex = function (hash) {
    return ipfsAPI.get(hash).then((buff) => {
        let shopsJson = JSON.parse(buff.toString('utf-8'))
        return Promise.resolve(shopsJson.shops);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    })
}

module.exports.refGood = function (shopHash, goodBasicHash, price, reserveNum) {
    var newS;

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
        return Promise.resolve(hash);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    })
}

module.exports.exposeShops = function(){
    return ipfsAPI.add(Buffer.from(JSON.stringify(shopGoods))).then(hash =>{
        return Promise.resolve(hash);
    })
}

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