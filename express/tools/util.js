var fs = require("fs")
var path = require('path')
var ipfsAPI = require("./ipfsAPI")
var config = require("../storage/config.json")

var current_accout = "";

module.exports.getCurrentAccout = function(){
    return current_accout;
}

module.exports.getConfig = function () {
    return config;
}

module.exports.setCurrentAccount = function(account){
    this.current_accout = account;
}

module.exports.refreshConfig = function (shops_hash) {
    var basePath = path.join(__dirname, '../storage/config.json');
    console.log(basePath);
    config.home_shop_index = shops_hash;
    fs.writeFileSync(basePath, JSON.stringify(config));
}

module.exports.getGoodInfoPromise = function (goodHash) {
    return new Promise(resolve, reject => {
        var goodData = {};
        return ipfsAPI.get(goodHash).then(buff => {
            var good_ori = JSON.parse(buff.toString('utf-8'));
            goodData.price = good_ori.price;
            goodData.reserveNum = good_ori.reserveNum;
            goodData.shopHash = good_ori.shopHash;
            goodData.basicHash = good_ori.basicHash;
            return ipfsAPI.get(good_ori.basicHash);
        }).then( buff=>{
            var basic_g = JSON.parse(buff.toString('utf-8'));
            goodData.name = basic_g.name;
            goodData.descripthion = basic_g.descripthion;
            goodData.product_img = basic_g.product_img;
            goodData.category = basic_g.category;
            return resolve(goodData);
        }).catch((err) => {
            console.log(err);
            return reject(err);
        });
    })
};

var getShopInfoPromise = function (shop_hash){
    return new Promise(resolve,reject =>{
        var shopData = {};
        return ipfsAPI.get(shop_hash).then(data =>{
            var shop_ori = JSON.parse(data.toString('utf-8'))
            shopData.name = shop_ori.name;
            shopData.descripthion = shop_ori.descripthion;
            shopData.banner = shop_ori.banner;
            shopData.hash = shop_hash;
            return resolve(shopData);
        }).catch((err) => {
            console.log(err);
            return reject(err);
        });
    })
}

module.exports.getIndexData = function (shops_hash) {
    var shops_data = {};
    //get shop list 
    return ipfsAPI.get(shops_hash).then((buff) => {
        let shops = JSON.parse(buff.toString('utf-8'))
        console.log(shops);
        var goods_promises = [];
        for (let key in shops) {
            shops_data[key] = {"goods":[]};
            shops[key].forEach(element => {
                goods_promises.push(getGoodInfoPromise(element));
            });
        }
        return Promise.all(goods_promises);
    }).then( results =>{
        results.forEach(good_data =>{
            shops_data[good_data.shopHash].goods.push(good_data);
        });
        var shop_info_promises = [];
        for(let key in shops_data){
            shop_info_promises.push(getShopInfoPromise(key));
        }
        return Promise.all(shop_info_promises);
    }).then(results =>{
        results.forEach(element =>{
            shops_data[element.hash]["shop_info"] = element;
        })
        return Promise.resolve(shops_data);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    })
}

