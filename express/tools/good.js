var fs = require("fs")
var path = require('path')
var ipfsAPI = require("./ipfsAPI")
var goodTemp = require("../storage/goodTmpl.json")
var goodObj = require("../storage/goods.json")
var shop_ref = require("../storage/shop_goods.json")
var utils = require('../tools/util')

/**
 * User buy good, keep to store
 * @param {*} address 
 * @param {*} good_hash 
 * @param {*} price 
 */
module.exports.keepGoodsToDB = function(address, good_hash, price){
    var basePath = path.join(__dirname,'../storage/',address,'_goods.json');
    var goods = JSON.parse(fs.readFileSync(basePath));
    if(!goods.hasOwnProperty("address")){
        goods["address"] = address;
        goods["goods"] = [];
        goods["goods_hash"] = [];
    }
    goods.goods_hash.push(good_hash);
    var isExist = false;
    goods.goods.forEach(element => {
        if(element.good_hash == good_hash){
            element.num += 1
            isExist = true;
            break
        }
    });
    if (!isExist) {
        goods.goods.push({"basic_hash": good_hash, "price": price, "num": 1})
    }
    fs.writeFileSync(basePath, JSON.stringify(goods));
}

/**
 * Get user's good from Json file
 * @param {*} address 
 */
module.exports.getUserGoodsFromDB = function(address){
    var basePath = path.join(__dirname,'../storage/',address,'_goods.json');
    var goods = JSON.parse(fs.readFileSync(basePath));
    var goods_data_pro = [];
    goods.goods_hash.forEach(element =>{
        goods_data_pro.push(element);
    });
    return Promise.all(goods_data_pro).then(results =>{
        var goods_tmp = {};
        goods.goods.forEach(element=>{
            goods_tmp[element.basic_hash] = element;
        })
        results.forEach(element =>{
            goods_tmp[element.basicHash].name = element.name;
            goods_tmp[element.basicHash].descripthion = element.descripthion;
            goods_tmp[element.basicHash].product_img = element.product_img;
            goods_tmp[element.basicHash].category = element.category;
        })
        goods.goods = [];
        for(let key in goods_tmp){
            goods.goods.push(goods_tmp[key]);
        }
        return goods;
    })
}

var presistBasicGoods = function(shopHash) {
    var basePath = path.join(__dirname,'../storage/',shopHash,'_basic_goods.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(goodObj));
}

var addBasicGoods = function(shopHash, good) {
    var basePath = path.join(__dirname,'../storage/',shopHash,'_basic_goods.json');
    var goodObj = JSON.parse(fs.readFileSync())
    if(goodObj.goodsHash.indexOf(good.hash))
    goodObj.goods.push(good);
    goodObj.goodsHash.push(good.hash);
}

/**
 * Get the good template
 */
var getGoodsTmpl = function() {
    return goodTemp;
}

/**
 * Shop keeper create basic good
 * @param {*} shopHash 
 * @param {*} name 
 * @param {*} disc 
 * @param {*} imagePath 
 * @param {*} catg 
 */
module.exports.createBasicGood = function(shopHash, name, disc, imagePath, catg) {
    var tmpl = getGoodsTmpl();
    var newG;
    //First, push the image to ipfs and get the hash
    var imgBuff = Buffer.from(fs.readFileSync(imagePath));
    return ipfsAPI.add(imgBuff).then((hash) => {
        console.log("Goods img upload to ipfs : " + hash);
        console.log("http://localhost:8080/ipfs/" + hash);
        //Second, create goodHash
        newG = tmpl;
        newG.name = name;
        newG.descripthion = disc;
        newG.product_img = hash;
        newG.category = catg;
        //Check the name is exist?
        return ipfsAPI.add(Buffer.from(JSON.stringify(newG)));
    }).then(hash => {
        console.log("Goods upload to ipfs : " + hash);
        console.log("http://localhost:8080/ipfs/" + hash);
        //Laod into the goods json
        newG.hash = hash;
        addBasicGoods(newG);
        presistBasicGoods(shopHash);
        return Promise.resolve(hash);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    })
}


module.exports.createGoodByImageReader = function(name, disc, imageBlob, catg) {
    var tmpl = getGoodsTmpl();
    var newG;
    //First, push the image to ipfs and get the hash
    var image_hash = "";
    var good_hash = "";
    
    var imgBuff = Buffer.from(imageBlob);
    ipfsAPI.add(imgBuff).then((hash) => {
        console.log("Goods img upload to ipfs : " + hash);
        console.log("http://localhost:8080/ipfs/" + hash);
        //Second, create goodHash
        image_hash = hash;
        newG = tmpl;
        newG.name = name;
        newG.descripthion = disc;
        newG.product_img = hash;
        newG.category = catg;
        //Check the name is exist?
        return ipfsAPI.add(Buffer.from(JSON.stringify(newG)));
    }).then(hash => {
        console.log("Goods upload to ipfs : " + hash);
        console.log("http://localhost:8080/ipfs/" + hash);
        good_hash = hash;
        //Laod into the goods json
        newG.hash = hash;
        addGoods(newG);

        presistGoods();
        //rename the image
        return Promise.resolve(hash);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err)
    })
}

module.exports.getGoodByHash = function(hash) {
    return ipfsAPI.get(hash).then((buff) => {
        let good = JSON.parse(buff.toString('utf-8'))
        console.log(good);
        return Promise.resolve(good);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    })
}

// console.log(getGoodsTmpl())

// console.log(this.createGood("iphone", "A good mobile phone for young", "../../images/iphone.jpg", "Digital"))