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
                    cleanTransactionSubject: cleanTransactionSubject
                    }
} else{
  module.exports = {getAccounts: getAccounts,
                    getTransactions:getTransactions
                    }
};

function getAccounts(access_token){
  var session = new figo.Session(access_token);
  // session.get_accounts(function(err, accounts){
  //   console.log(accounts[0]);
  // })
  return Q.promise(function(resolve, reject){
    session.get_accounts(function(error, accounts){
      if(error)
        reject(error);
      resolve(accounts);
    });
  });
};

function getTransactions(account_id, access_token){
  var session = new figo.Session(access_token);
  // session.get_transactions(account_id, function(err, transactions){
  //   transactions = transactions.filter(transactionFilter);
  //   transactions = transactions.map(cleanTransactionSubject);
  // });
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

function transactionFilter(transaction){
  return(dateFormat(transaction.booking_date, 'dd-mm-yyyy') === dateFormat(new Date(), 'dd-mm-yyyy'));
};

function cleanTransactionSubject(transaction){
  var pattern = /\d+\.\d+/
  try{
    var purpose = transaction.purpose.match(pattern);
    if(purpose == null)
      throw Error('Subject without Invest and Project');
    transaction.purpose = {investID: purpose[0].split('.')[0], projectID: purpose[0].split('.')[1]};
    return(transaction);
  }catch(e){
    return(e);
  };
};

function makePayment(){
  //payment logic here for receiving money for specific account with specific transaction subject
};

function makeTrasaction(/*summ*//*list of users with sums*/){
  //logic for performing transactions to customers from specific account with transaction amount dependent from customers investment share
}

function getTransactionsForAccount(account){

}
