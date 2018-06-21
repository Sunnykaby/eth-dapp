MarketIndex = {
    web3Provider: null,
    contracts: {},
    storagePath: "../../storage/",

    homePage: function(){
        
        $.getJSON(this.storagePath.concat("config.json"), function(data){
            var shops_hash  = data.home_index;
            //Get the shop_list from IPFS

        })
    },

    init: function() {
        // Load goods.
        $.getJSON('../../storage/goods.json', function(data) {
            var petsRow = $('#GoodsRow');
            var petTemplate = $('#goodTemplate');

            for (i = 0; i < data.length; i++) {
                petTemplate.find('.panel-title').text(data[i].goodName);
                petTemplate.find('img').attr('src', data[i].goodImg);
                petTemplate.find('.good-name').text(data[i].goodName);
                petTemplate.find('.good-disc').text(data[i].goodDisc);
                petTemplate.find('.good-catg').text(data[i].goodCatg);
                petTemplate.find('.good-owner').text(data[i].goodOwner);
                petTemplate.find('.btn-buy').attr('data-id', data[i].id);

                petsRow.append(petTemplate.html());
            }
        });

        return GoodsList.initWeb3();
    },

    initWeb3: function() {
        // Get the web3 instance
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            GoodsList.web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            GoodsList.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(GoodsList.web3Provider);

        return GoodsList.initContract();
    },

    initContract: function() {
        // 加载Adoption.json，保存了Adoption的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
        $.getJSON('Adoption.json', function(data) {
            // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
            var AdoptionArtifact = data;
            GoodsList.contracts.Adoption = TruffleContract(AdoptionArtifact);

            // Set the provider for our contract
            GoodsList.contracts.Adoption.setProvider(GoodsList.web3Provider);

            // Use our contract to retrieve and mark the adopted pets
            return GoodsList.markAdopted();
        });

        return GoodsList.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-adopt', GoodsList.handleAdopt);
    },

    markAdopted: function(adopters, account) {
        var adoptionInstance;

        GoodsList.contracts.Adoption.deployed().then(function(instance) {
            adoptionInstance = instance;

            // 调用合约的getAdopters(), 用call读取信息不用消耗gas
            return adoptionInstance.getAdopters.call();
        }).then(function(adopters) {
            for (i = 0; i < adopters.length; i++) {
                if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                    $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
                }
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    handleAdopt: function(event) {
        event.preventDefault();

        var petId = parseInt($(event.target).data('id'));

        var adoptionInstance;

        // 获取用户账号
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            GoodsList.contracts.Adoption.deployed().then(function(instance) {
                adoptionInstance = instance;

                // 发送交易领养宠物
                return adoptionInstance.adopt(petId, { from: account });
            }).then(function(result) {
                return GoodsList.markAdopted();
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },

};

$(function() {
    $(window).load(function() {
        GoodsList.init();
    });
});