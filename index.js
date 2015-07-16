var figo = require('figo');
var Q = require('q');
var dateFormat = require('dateformat');

var credentials = {
  "app_url": "http://localhost:3000",
  "client_secret": "S_pWwIfXWmdtUbEUJhk9QAXmUGgsaG_zUzNGE8IzaP1U",
  "client_id": "CGh0sN9QEmnnLLXLBacCLzeMhagoW5fvUaY1dDe-zQ-0"
};

if(process.env.NODE_ENV == 'test'){
  module.exports = {getAccounts: getAccounts,
                    getTransactions:getTransactions,
                    transactionFilter: transactionFilter,
                    makePayment: makePayment,
                    cleanTransactionSubject: cleanTransactionSubject,
                    createPaymentContainer: createPaymentContainer,
                    submitPayment: submitPayment,
                    getPayments: getPayments
                    }
} else{
  module.exports = {getAccounts: getAccounts,
                    getTransactions:getTransactions,
                    makePayment: makePayment,
                    getPayments: getPayments,
                    submitPayment: submitPayment
                    }
};

function getAccounts(access_token){
  if(!access_token)
    return(Error('Access token should be passed'));
  var session = new figo.Session(access_token);
  return Q.promise(function(resolve, reject){
    session.get_accounts(function(error, accounts){
      if(error)
        reject(error);
      resolve(accounts[1]);
    });
  });
};

function getTransactions(account_id, access_token){
  if(!access_token || !account_id)
    return(Error('Access token and Account ID should be passed'));
  var session = new figo.Session(access_token);
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

//to much parameters logic should be changed
// test account A1.1 does not support container payments
function makePayment(access_token, account, amount, users_list){
  var payment_payload = {
    "account_id": account.account_id,
    "amount": amount,
    // "container": createPaymentContainer(account, users_list),
    //----------
    "bank_code": users_list.bank_code,
    "iban": users_list.iban,
    "account_number": users_list.account_number,
    "currency": "EUR",
    "name": "bettervest",
    "purpose": "some optional information here",
    "type": "Transfer",
    //-------
    dump: function(){return this}
  };
  var session = new figo.Session(access_token);
  return Q.promise(function(resolve, reject){
    session.add_payment(payment_payload, function(err, payment){
      if(err)
        reject(err);
      resolve(payment);
    });
  });
};

function submitPayment(payment, account, access_token){
  var session = new figo.Session(access_token);
  return Q.promise(function(resolve, reject){
    session.submit_payment(payment, account.supported_tan_schemes[0].tan_scheme_id, 'payment submitted', 'localhost:3000', function(err, result){
      if(err)
        reject(err);
      //result is url which must to be opened by user probably for payment approvement
      resolve(result);
    });
  });
};

function getPayments(account, access_token){
  session = new figo.Session(access_token);
  return Q.promise(function(resolve, reject){
    session.get_payments(account.account_id, function(err, data){
      if(err)
        reject(err);
      resolve(data);
    });
  });
};
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
function createPaymentContainer(account, users_list){
  var container = [];
  if(!Array.isArray(users_list)){
    var val = users_list;
    users_list = new Array();
    users_list.push(val);
  };
  try{
    users_list.forEach(function(listEntry){
      var payment = {
        "account_id": account.account_id,
        "amount": listEntry.amount,
        "bank_code": listEntry.bank_code,
        "iban": listEntry.iban,
        // "bank_name": listEntry.bank_name, //not really necessary
        "account_number": listEntry.account_number,
        "currency": "EUR",
        "name": "bettervest",
        "purpose": "some optional information here",
        "type": "Transfer",
        dump: function(){return this}
      };
      container.push(payment);
    });
  } catch(e){
    return(e);
  }

  return container;
};
