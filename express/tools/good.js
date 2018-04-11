var fs = require("fs")
var path = require('path')
var ipfsAPI = require("./ipfsAPI")
var goodTemp = require("../storage/goodTmpl.json")
var goodObj = require("../storage/goods.json")

var getGoodsTmpl = function() {
    return goodTemp;
}

var getGoods = function(isCache) {
    if (isCache) {
        return goodObj.goods;
    } else {
        var goodsF = fs.readFileSync("../storage/goods.json")
        return JSON.parse(goodsF).goods;
    }

}

var addGoods = function(good) {
    if(goodObj.goodsHash.indexOf(good.hash))
    goodObj.goods.push(good);
    goodObj.goodsHash.push(good.hash);
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

var presistGoods = function() {
    var basePath = path.join(__dirname,'../storage/goods.json');
    console.log(basePath);
    fs.writeFileSync(basePath, JSON.stringify(goodObj));
}

module.exports.createGood = function(name, disc, imagePath, catg, price) {
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
        newG.price = price;
        //Check the name is exist?
        return ipfsAPI.add(Buffer.from(JSON.stringify(newG)));
    }).then(hash => {
        console.log("Goods upload to ipfs : " + hash);
        console.log("http://localhost:8080/ipfs/" + hash);
        //Laod into the goods json
        newG.hash = hash;
        addGoods(newG);
        presistGoods();
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



// console.log(getGoodsTmpl())

// console.log(this.createGood("iphone", "A good mobile phone for young", "../../images/iphone.jpg", "Digital"))