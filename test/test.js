var assert = require('assert');
var sinon = require('sinon');
var index = require('../index.js');
var q = require('q');
var figo = require('figo');

var ACCESS_TOKEN = "ASHWLIkouP2O6_bgA2wWReRhletgWKHYjLqDaqb0LFfamim9RjexTo22ujRIP_cjLiRiSyQXyt2kM1eXU2XLFZQ0Hro15HikJQT_eNeT_9XQ";

//doubling figo library
beforeEach(function(){
  this.stub = sinon.stub(figo, 'Session');
  this.stub.returns({
    get_transactions: function(){},
    get_accounts: function(){},
    add_payment: function(){},
    submit_payment: function(){}
  });
});

afterEach(function(){
  this.stub.restore();
});
describe('bettervest Figo library test', function(){
  describe('getAccounts function', function(){
    it('should have function getAccounts', function(){
      assert.equal(typeof index.getAccounts, 'function');
    });

    it('should accept one parameter', function(){
      assert.equal(index.getAccounts.length, 1);
    });

    it('should return error if access token was not passed', function(){
      console.log(index.getAccounts())
      assert.equal(index.getAccounts().message, 'Access token should be passed')
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.getAccounts(ACCESS_TOKEN);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should create figo session', function(){
      index.getAccounts(ACCESS_TOKEN);

      assert.equal(this.stub.called, true);
    });

    it('should call figo get_accounts method', function(){
      var spy = sinon.spy(this.stub(), 'get_accounts');

      index.getAccounts(ACCESS_TOKEN);
      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.getAccounts(ACCESS_TOKEN).inspect().state, 'pending');
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
      index.getTransactions('1', ACCESS_TOKEN);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should create figo session', function(){
      index.getTransactions('1', ACCESS_TOKEN);

      assert.equal(this.stub.called, true);
    });

    it('should call figo get_transactions method', function(){
      var spy = sinon.spy(this.stub(), 'get_transactions');
      index.getTransactions('1', ACCESS_TOKEN);

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.getTransactions('1', ACCESS_TOKEN).inspect().state, 'pending');
    });
  });

  describe('makePayment function', function(){
    it('should have makePayment function', function(){
      assert.equal(typeof index.makePayment, 'function');
    });

    it('it should accept four parameters', function(){
      assert.equal(index.makePayment.length, 4);
    });
    //parameters validation should be added
    it('should create figo session', function(){
      index.makePayment(ACCESS_TOKEN, {}, 'sum', {});

      assert.equal(this.stub.called, true);
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.makePayment(ACCESS_TOKEN, {}, 'sum', {});

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should call figo add_payment method', function(){
      var spy = sinon.spy(this.stub(), 'add_payment');
      index.makePayment(ACCESS_TOKEN, {}, 'sum', {});

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should return pending promise', function(){
      assert.equal(index.makePayment(ACCESS_TOKEN, {}, 'sum', {}).inspect().state, 'pending');
    });
  });

  describe('submitPayment function', function(){
    it('should have submitPayment function', function(){
      assert.equal(typeof index.submitPayment, 'function');
    });

    it('should accept three parameters', function(){
      assert.equal(index.submitPayment.length, 3);
    });

    it('should create figo session', function(){
      index.submitPayment({},{},{});

      assert.equal(this.stub.called, true);
    });

    it('should create promise', function(){
      var spy = sinon.spy(q, 'promise');
      index.submitPayment({},{},{});

      assert.equal(spy.called, true);

      spy.restore();
    });

    it('should call figo submit_payment function', function(){
      var spy = sinon.spy(this.stub(), 'submit_payment');
      index.submitPayment({supported_tan_schemes:[{tan_scheme_id: '1'}]},{}, ACCESS_TOKEN);

      assert.equal(spy.called, true);

      spy.restore();
    });
  });

  it('should return pending promise', function(){
    assert.equal(index.submitPayment({supported_tan_schemes:[{tan_scheme_id: '1'}]}, {}, ACCESS_TOKEN).inspect().state, 'pending');
  });

  describe('createPaymentContainer function', function(){
    it('shoud have createPaymentContainer function', function(){
      assert.equal(typeof index.createPaymentContainer, 'function');
    });

    it('should accept two parameters', function(){
      assert.equal(index.createPaymentContainer.length, 2);
    });
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
});
