var assert = require('assert');
var sinon = require('sinon');
var index = require('../index.js');
var credentials = require('../credentials.js');
var q = require('q');
var figo = require('figo');

//doubling figo library
beforeEach(function(){
  this.stubSession = sinon.stub(figo, 'Session');
  this.stubSession.returns({
    get_transactions: function(){},
    get_accounts: function(){},
    add_payment: function(){},
    submit_payment: function(){},
    get_payments: function(){},
    query_api: function(){}
  });

  this.stubConnection = sinon.stub(figo, 'Connection');
  this.stubConnection.returns({
    query_api: function(){}
  });
});

afterEach(function(){
  this.stubSession.restore();
  this.stubConnection.restore();
});

describe('bettervest Figo library test', function(){
  describe('getToken function', function(){
    it('should have getToken function', function(){
      assert.equal(typeof index.getToken, 'function');
    });

    it('should accept two parameters', function(){
      assert.equal(index.getToken.length, 2);
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.getToken(credentials.username, credentials.password);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should create figo connection', function(){
      index.getToken(credentials.username, credentials.password);

      assert.equal(this.stubConnection.called, true);
    });

    it('should call figo get_accounts method', function(){
      var spy = sinon.spy(this.stubConnection(), 'query_api');

      index.getToken(credentials.username, credentials.password);
      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.getToken(credentials.username, credentials.password).inspect().state, 'pending');
    });

  });

  describe('getAccounts function', function(){
    it('should have function getAccounts', function(){
      assert.equal(typeof index.getAccounts, 'function');
    });

    it('should accept one parameter', function(){
      assert.equal(index.getAccounts.length, 1);
    });

    // it('should return error if access token was not passed', function(){});

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.getAccounts(credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should create figo session', function(){
      index.getAccounts(credentials.access_token);

      assert.equal(this.stubSession.called, true);
    });

    it('should call figo get_accounts method', function(){
      var spy = sinon.spy(this.stubSession(), 'get_accounts');

      index.getAccounts(credentials.access_token);
      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.getAccounts(credentials.access_token).inspect().state, 'pending');
    });
  });

  describe('getTransactions function', function(){
    it('should have function getTransactions', function(){
      assert.equal(typeof index.getTransactions, 'function');
    });

    it('should accept two parameters', function(){
      assert.equal(index.getTransactions.length, 2);
    });

    it('should return error if access token and account id were not passed', function(){
      assert.equal(index.getTransactions().message, 'Access token and Account ID should be passed');
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.getTransactions('1', credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should create figo session', function(){
      index.getTransactions('1', credentials.access_token);

      assert.equal(this.stubSession.called, true);
    });

    it('should call figo get_transactions method', function(){
      var spy = sinon.spy(this.stubSession(), 'get_transactions');
      index.getTransactions('1', credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.getTransactions('1', credentials.access_token).inspect().state, 'pending');
    });
  });

  describe('makePayment function', function(){
    it('should have makePayment function', function(){
      assert.equal(typeof index.makePayment, 'function');
    });

    it('should accept three parameters', function(){
      assert.equal(index.makePayment.length, 3);
    });
    //parameters validation should be added
    it('should create figo session', function(){
      index.makePayment(credentials.account_from, credentials.account_to, 'test', credentials.access_token);

      assert.equal(this.stubSession.called, true);
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.makePayment(credentials.account_from, credentials.account_to, 'test', credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should call figo add_payment method', function(){
      var spy = sinon.spy(this.stubSession(), 'add_payment');
      index.makePayment(credentials.account_from, credentials.account_to, 'test', credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.makePayment(credentials.account_from, credentials.account_to, 'test', credentials.access_token).inspect().state, 'pending');
    });

    // it('should throw error if receiver is not valid', function(){
    //   var data = {
    //     bank_name: 'bank',
    //     account_number: '123',
    //     transaction_topic: 'topic'
    //   };
    //   assert.throws(index.createPaymentContainer(credentials.account_to, data), Error);
    // });
  });

  describe('submitPayment function', function(){
    it('should have submitPayment function', function(){
      assert.equal(typeof index.submitPayment, 'function');
    });

    it('should accept three parameters', function(){
      assert.equal(index.submitPayment.length, 3);
    });

    it('should create figo session', function(){
      index.submitPayment(credentials.payment, credentials.account_from, credentials.access_token);

      assert.equal(this.stubSession.called, true);
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.submitPayment({},{},{});

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should call figo submit_payment function', function(){
      var spy = sinon.spy(this.stubSession(), 'submit_payment');
      index.submitPayment(credentials.payment, credentials.account_from, credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.submitPayment(credentials.payment, credentials.account_from, credentials.access_token).inspect().state, 'pending');
    });
  });

  describe('getPayments function', function(){
    it('should have getPayments function', function(){
      assert.equal(typeof index.getPayments, 'function');
    });

    it('should accept two parameters', function(){
      assert.equal(index.getPayments.length, 2);
    });

    it('shoud create figo Session', function(){
      index.getPayments(credentials.account_from, credentials.access_token);

      assert.equal(this.stubSession.called, true);
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.getPayments(credentials.account_from, credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should retrun pending promise', function(){
      assert.equal(index.getPayments(credentials.account_from, credentials.access_token).inspect().state, 'pending');
    });
  });

  describe('setupAccount function', function(){
    it('should have setupAccount function', function(){
      assert.equal(typeof index.setupAccount, 'function');
    });

    it('should accept two parameters', function(){
      assert.equal(index.setupAccount.length, 2);
    });

    it('should create figo session', function(){
      index.setupAccount({}, credentials.access_token);

      assert.equal(this.stubSession.called, true);
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.setupAccount({}, {});

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should call query_api function', function(){
      var spy = sinon.spy(this.stubSession(), 'query_api');
      index.setupAccount({}, credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.setupAccount({}, credentials.access_token).inspect().state, 'pending');
    });
  });

  describe('createPaymentContainer function', function(){
    it('shoud have createPaymentContainer function', function(){
      assert.equal(typeof index.createPaymentContainer, 'function');
    });

    it('should accept two parameters', function(){
      assert.equal(index.createPaymentContainer.length, 2);
    });

    // it('should throw error if receiver is not valid', function(){
    //   var data = {
    //     bank_name: 'bank',
    //     account_number: '123',
    //     transaction_topic: 'topic'
    //   };
    //   assert.throws(index.createPaymentContainer(credentials.account_to, [data, data]), Error);
    // });
  });

  describe('transactionFilter function', function(){
    it('should have transactionFilter function', function(){
      assert.equal(typeof index.transactionFilter, 'function');
    });

    it('should accept one parameter', function(){
      assert.equal(index.transactionFilter.length, 1);
    });

    it('should return true if transaction booking_date is today', function(){
      transaction = {booking_date: new Date()};
      assert.equal(index.transactionFilter(transaction), true);
    });

    it('should return false if transaction booking_date is not today', function(){
      date = new Date(0)
      transaction = {booking_date: date};
      assert.equal(index.transactionFilter(transaction), false);
    });
  });
  describe('cleanTransactionSubject function', function(){
    it('should have cleanTransactionSubject function', function(){
      assert.equal(typeof index.cleanTransactionSubject, 'function');
    });

    it('should accept one parameter', function(){
      assert.equal(index.cleanTransactionSubject.length, 1);
    });

    it('should return null if subject have no Invest and Project ids', function(){
      var transaction = {purpose: 'subject without ids'};

      assert.equal(index.cleanTransactionSubject(transaction).message, Error('Subject without Invest and Project').message);
    });

    it('shoud return object with ids if subject is correct', function(){
      var transaction = {purpose: '123.456'};
      var clean_subject = index.cleanTransactionSubject(transaction).purpose;

      assert.equal(clean_subject.investID, '123');
      assert.equal(clean_subject.projectID, '456');
    });

    it('shoud return object with ids if subject is has other characters', function(){
      var transaction = {purpose: 'sending to 123.456 as investment'};
      var clean_subject = index.cleanTransactionSubject(transaction).purpose;

      assert.equal(clean_subject.investID, '123');
      assert.equal(clean_subject.projectID, '456');
    });
  });

  describe('validReceiver helper', function(){
    it('should have validReceiver function', function(){
      assert.equal(typeof index.validReceiver, 'function');
    });

    it('should return true if entry parameter is valid', function(){
      var data = {
        amount: 10,
        bank_code: '123',
        bank_name: 'bank',
        account_number: '123',
        transaction_topic: 'topic'
      };
      assert.equal(index.validReceiver(data), true);
    });

    it('should return false if entry parameter is not valid', function(){
      var data = {
        bank_name: 'bank',
        account_number: '123',
        transaction_topic: 'topic'
      };
      assert.equal(index.validReceiver(data), false);
    });
  });

  describe('get bank login settings', function(){
    it('shoud have getLoginSettings funtion', function(){
      assert.equal(typeof index.getLoginSettings, 'function');
    });

    it('should accept two parameter', function(){
      assert.equal(index.getLoginSettings.length, 2);
    });

    it('should create figo session', function(){
      index.getLoginSettings('bank_code', credentials.access_token);

      assert.equal(this.stubSession.called, true);
    });

    it('should query figo API', function(){
      var spy = sinon.spy(this.stubSession(), 'query_api');
      index.getLoginSettings('bank_code', credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.getLoginSettings('bank_code', credentials.access_token);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.getLoginSettings('bank_code', credentials.access_token).inspect().state, 'pending');
    });
  });
});
