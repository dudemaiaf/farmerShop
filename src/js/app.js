App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    $.getJSON('../Grocerie.json', function(data) {
      var groceriesRow = $('#groceriesRow');
      var grocerieTemplate = $('#grocerieTemplate');

      for (i = 0; i < data.length; i ++) {
        grocerieTemplate.find('.panel-title').text(data[i].name);
        grocerieTemplate.find('img').attr('src', data[i].picture);
        grocerieTemplate.find('.grocerie-who').text(data[i].who);
        grocerieTemplate.find('.grocerie-quantity').text(data[i].quantity);
        grocerieTemplate.find('.grocerie-location').text(data[i].location);
        grocerieTemplate.find('.grocerie-price').text(data[i].price);
        grocerieTemplate.find('.btn-buy').attr('data-id', data[i].id);

        groceriesRow.append(grocerieTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Purchase.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var PurchaseArtifact = data;
      App.contracts.Purchase = TruffleContract(PurchaseArtifact);

      console.log(TruffleContract(PurchaseArtifact));
    
      // Set the provider for our contract
      App.contracts.Purchase.setProvider(App.web3Provider);
    
      return App.markPurchased();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handlePurchase);
  },

  markPurchased: function() {
    var purchaseInstance;

    App.contracts.Purchase.deployed().then(function(instance) {
      purchaseInstance = instance;
    
      return purchaseInstance.getConsumers.call();
    }).then(function(consumers) {
      for (i = 0; i < consumers.length; i++) {
        if (consumers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-grocerie').eq(i).find('button').text('Sem estoque').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handlePurchase: function(event) {
    event.preventDefault();

    var groceriePrice = parseInt($(event.target).data('price'));

    var purchaseInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
      var account_saver = accounts[1];

      App.contracts.Purchase.deployed().then(function(instance) {
        purchaseInstance = instance;
    
        
        return purchaseInstance.buy({from: account}, account_saver, groceriePrice);
      }).then(function(result) {
        return App.markPurchased();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
