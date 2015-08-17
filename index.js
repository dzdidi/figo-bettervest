var figo = require('figo');
var Q = require('q');
var dateFormat = require('dateformat');
var https = require('https');

var credentials = require('./credentials.js');

if(process.env.NODE_ENV == 'test'){
  module.exports = {getToken: getToken,
                    getAccounts: getAccounts,
                    getTransactions:getTransactions,
                    transactionFilter: transactionFilter,
                    makePayment: makePayment,
                    cleanTransactionSubject: cleanTransactionSubject,
                    createPaymentContainer: createPaymentContainer,
                    submitPayment: submitPayment,
                    getPayments: getPayments,
                    setupAccount: setupAccount,
                    validReceiver: validReceiver,
                    getLoginSettings: getLoginSettings
                  };
} else{
  module.exports = {getAccounts: getAccounts,
                    getTransactions:getTransactions,
                    makePayment: makePayment,
                    getPayments: getPayments,
                    submitPayment: submitPayment,
                    getToken: getToken,
                    setupAccount: setupAccount,
                    getLoginSettings: getLoginSettings
                  };
};

function getToken(username, password){
  var options = {
    "grant_type": "password",
    "username": username,
    "password": password
  };

  return Q.promise(function(resolve, reject){
    var connection = new figo.Connection(credentials.client_id, credentials.client_secret);
    connection.query_api("/auth/token", options, function(err, data){
      if(err)
        reject(err);
      resolve(data);
    });
  });
};

function getAccounts(access_token){
  if(!access_token)
    throw(Error('Access token should be passed'));
  var session = new figo.Session(access_token.access_token);
  return Q.promise(function(resolve, reject){
    session.get_accounts(function(error, accounts){
      if(error)
        reject(error);
      resolve(accounts);
    });
  });
};

function getTransactions(account_id, access_token){
  if(!access_token || !account_id)
    return(Error('Access token and Account ID should be passed'));
  var session = new figo.Session(access_token.access_token);
  return Q.promise(function(resolve, reject){
    session.get_transactions(function(error, transactions){
      if(error)
        reject(error);
      transactions = transactions.filter(transactionFilter);
      transactions = transactions.map(cleanTransactionSubject);
      resolve(transactions);
    });
  });
};

// test account A1.1 does not support container payments
function makePayment(account, user_or_list, access_token){
  // normal payment
  if(!Array.isArray(user_or_list)){
    if(!validReceiver(user_or_list))
      return(Error('receiver is not valid')); // should be changed to exception
    var payment_payload = {
      "account_id": account.account_id,
      "amount": user_or_list.amount,
      "bank_code": user_or_list.bank_code,
      "bank_name": user_or_list.iban,
      "account_number": user_or_list.account_number,
      "currency": "EUR",
      "name": "bettervest",
      "purpose": user_or_list.transaction_topic,
      "type": "Transfer",
      dump: function(){return this}
    };
  } else {
    // container payment
    var payment_payload = {
      "account_id": account.account_id,
      "container": createPaymentContainer(account, user_or_list),
      "type": "Transfer",
      dump: function(){return this}
    };
  }

  var session = new figo.Session(access_token.access_token);
  return Q.promise(function(resolve, reject){
    session.add_payment(payment_payload, function(err, payment){
      if(err)
        reject(err);
      resolve(payment);
    });
  });
};

function submitPayment(payment, account, access_token){
  var session = new figo.Session(access_token.access_token);
  return Q.promise(function(resolve, reject){
    session.submit_payment(payment, account.supported_tan_schemes[0].tan_scheme_id, 'payment submitted', credentials.redirect_payment, function(err, result){
      if(err)
        reject(err);
      //result is url which must to be opened by user probably for payment approvement
      resolve(result);
    });
  });
};

function getPayments(account, access_token){
  session = new figo.Session(access_token.access_token);
  return Q.promise(function(resolve, reject){
    session.get_payments(account.account_id, function(err, data){
      if(err)
        reject(err);
      resolve(data);
    });
  });
};

// returns response with taks_token
/*
open http://api.figo.me/task/start?id=<task token> for strating task (PIN/TAN entry can be required)
*/
function setupAccount(bank_credentials, access_token){
  session = new figo.Session(access_token.access_token);

  return Q.promise(function(resolve, reject){
    getLoginSettings(bank_credentials.bank_code, access_token).then(function(loginFields, access_token){
      var data = {
        bank_code: bank_credentials.bank_code,
        iban: bank_credentials.iban,
        country: 'de',
        credentials: [],
        save_pin: true,
        disable_first_sync: false
      };

      loginFields.credentials.forEach(function(field){
        data.credentials.push(bank_credentials[field.label]);
      });

      session.query_api('/rest/accounts', data, 'POST', function(err, data){
        console.log(err);
        if(err)
          reject(err);
        resolve(data);
      });
    });
  });
};

function getLoginSettings(bank_code, access_token){
  session = new figo.Session(access_token.access_token);
  return Q.promise(function(resolve, reject){
    session.query_api('/rest/catalog/banks/de/'+bank_code, {}, 'GET', function(err, data){
      if(err)
        reject(err);
      resolve(data);
    });
  });
}
/* ==========================
    additional logic helpers
   ========================== */

function transactionFilter(transaction){
  return(dateFormat(transaction.booking_date, 'dd-mm-yyyy') === dateFormat(new Date(), 'dd-mm-yyyy'));
};

function cleanTransactionSubject(transaction){
  var pattern = /\d+\.\d+/
  var purpose = transaction.purpose.match(pattern);
  if(purpose == null)
      return Error('Subject without Invest and Project');
  transaction.purpose = {investID: purpose[0].split('.')[0], projectID: purpose[0].split('.')[1]};
  return(transaction);
};

// should be rewised
function createPaymentContainer(account, user_or_list){
  var container = [];
    user_or_list.forEach(function(listEntry){
      if(!validReceiver(listEntry))
        throw(Error('one of receivers is not valid')); // should be changed to exception
      var payment = {
        "account_id": account.account_id,
        "amount": listEntry.amount,
        "bank_code": listEntry.bank_code,
        "bank_name": listEntry.bank_name,
        "account_number": listEntry.account_number,
        "currency": "EUR",
        "name": "bettervest",
        "purpose": user_or_list.transaction_topic,
        "type": "Transfer",
        dump: function(){return this}
      };
      container.push(payment);
    });
  return container;
};

function validReceiver(user){
  if(!user.amount || !user.bank_code || !user.bank_name || !user.account_number || !user.transaction_topic)
    return false;
  return true;
};
