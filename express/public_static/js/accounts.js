
$(document).ready(function () {
  var curraccount;
  var selectedAccount;
  //Get account from the eth
  $.get('/getAccounts', function (response) {
    for (let i = 0; i < response.length; i++) {
      curraccount = response[i];
      $('#options').append("<option value='" + curraccount + "'>" + curraccount + "</option>");
    }
  });

  $('#ag').click(function () {
    $('.addGood').addClass('active');
    $('.shop').removeClass('active');
    $('.buyGood').removeClass('active');
    $('.send').removeClass('active');
    $('#goodOwn').val(selectedAccount);
    console.log(selectedAccount);
  });

  $('#gl').click(function () {
    $('.addGood').removeClass('active');
    $('.shop').addClass('active');
    $('.buyGood').removeClass('active');
    $('.send').removeClass('active');
    //get goods
    console.log(selectedAccount);
    $.post('/getGood', { account: selectedAccount, owner: selectedAccount }, function (data) {
      console.log(data);
      var goodsRow = $('#GoodsRow');
      goodsRow.empty();
      var goodTemplate = $('#goodTemplate');

      goodTemplate.find('.panel-title').text(data.goodObj.name);
      goodTemplate.find('img').attr('src', "http://localhost:8080/ipfs/" + data.goodObj.product_img);
      goodTemplate.find('.good-name').text(data.goodObj.name);
      goodTemplate.find('.good-disc').text(data.goodObj.descripthion);
      goodTemplate.find('.good-catg').text(data.goodObj.category);
      goodTemplate.find('.good-price').text(data.goodObj.price);
      goodTemplate.find('.good-owner').text(selectedAccount);
      goodTemplate.find('.btn-buy').addClass('noview')

      goodsRow.append(goodTemplate.html());
      
    });
  });

  $('#bg').click(function () {
    $('.addGood').removeClass('active');
    $('.shop').removeClass('active');
    $('.buyGood').addClass('active');
    $('.send').removeClass('active');
  });

  $('#sm').click(function () {
    $('.addGood').removeClass('active');
    $('.shop').removeClass('active');
    $('.buyGood').removeClass('active');
    $('.send').addClass('active');
  });

  $('#submit').click(function () {
    selectedAccount = $('#options').val();
    console.log(selectedAccount);
    $.post('/getBalance', { account: selectedAccount }, function (response) {
      $('.select').removeClass("active");
      $('.options').addClass("active");
      $('.account').addClass("active");
      $('#account').text(selectedAccount);
      $('#balance').text(response[0]);
      var current_account_index = response[1].indexOf(selectedAccount);
      response[1].splice(current_account_index, 1); //remove the selected account from the list of accounts you can send to.
      $('#all-accounts').addClass("active");
      var list = $('#all-accounts > ol');
      for (let i = 0; i < response[1].length; i++) {
        li = "<li>" + response[1][i] + "</li>";
        list.append(li)
      }
    })
  });

  $('#submit-bk').click(function () {
    selectedAccount = $('#options').val();
    console.log(selectedAccount);
    $.post('/getBalance', { account: selectedAccount }, function (response) {
      $('.select').removeClass("active");
      $('.send').addClass("active");
      $('#account').text(selectedAccount);
      $('#balance').text(response[0]);
      var current_account_index = response[1].indexOf(selectedAccount);
      response[1].splice(current_account_index, 1); //remove the selected account from the list of accounts you can send to.
      $('#all-accounts').addClass("active");
      var list = $('#all-accounts > ol');
      for (let i = 0; i < response[1].length; i++) {
        li = "<li>" + response[1][i] + "</li>";
        list.append(li)
      }
    })
  });

  $('#getGA').click(function () {
    let targetAcc = $('#targetAcc').val();
    var goodsRow = $('#GoodsRowBuy');
      //rm the good
      goodsRow.empty();
    $.post('/getGood', { account: targetAcc, owner: targetAcc }, function (data) {
      console.log(data);
      // var goodsRow = $('#GoodsRowBuy');
      // //rm the good
      // goodsRow.empty();
      var goodTemplate = $('#goodTemplateBuy');

      goodTemplate.find('.panel-title').text(data.goodObj.name);
      goodTemplate.find('img').attr('src', "http://localhost:8080/ipfs/" + data.goodObj.product_img);
      goodTemplate.find('.good-name').text(data.goodObj.name);
      goodTemplate.find('.good-disc').text(data.goodObj.descripthion);
      goodTemplate.find('.good-catg').text(data.goodObj.category);
      goodTemplate.find('.good-price').text(data.goodObj.price);
      goodTemplate.find('.good-owner').text(targetAcc);
      goodTemplate.find('.good-ipfs').text(data.goodHash);
      goodTemplate.find('.btn-buy').attr('id', 'buyGoodA');
      goodTemplate.find('.btn-buy').attr('data-id', data.goodHash);
      goodsRow.append(goodTemplate.html());
      $(document).on('click', '.btn-buy', function (event) {
        event.preventDefault();
        var ipfs_hash = $(event.target).data('id');
        var goodsRow = $('#GoodsRowBuy');
        var owner = goodsRow.find('.good-owner').text();
        var goodHash = goodsRow.find('.good-ipfs').text();
        $.post('/buyGood', {account:selectedAccount,owner:targetAcc,goodHash:goodHash}, function(status){
          alert(JSON.stringify(status));
        });
      });
    });
  });

  $('#send').click(function () {
    $('#status').text("Sending...");
    let amount = $('#amount').val();
    let receiver = $('#receiver').val();
    $.post('/sendCoin', { amount: amount, sender: selectedAccount, receiver: receiver }, function (response) {
      $('#balance').text(response);
      $('#status').text("Sent!!");
    })
  });


})
