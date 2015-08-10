# figo-bettervest
This is the NodeJS library for connection work with figo API https://api.figo.me/

The authorization is made for user credentials grant type only.

To use it you need to have `ClientID` and `Secret` keys issued by figo and store them in file examples.js in a project directory

First you need to invoke method `getToken(<user email>, <password>)` it will return promise for token object for access.

 `getToken(<user email>, <password>)` - performs credentials authorization

`getAccounts(<token object>)` - return promise for array of figo account objects belonged to user you logged in

`getTransactions(<account_id>, <token_object>)` - returns promise for array of figo transaction objects

`makePayment(<account_from>, <account_to>, <token_object>)` -  /`account_to` can be account object or array of accounts, each of which should have `transaction_topic`, `amount`, `bank_code`, `bank_name`, `account_number`. It returns promise for payment object with figo ID, first account parameter is for sender, second is for receiver

`submitPayment(<payment_object>, <account_object>, <token_object>)` - submitting payment to figo tasks pull and returns promise for a link for TAN processing (account required for obtaining TAN processing schema takes first one for passed account)

`getPayments(<account_object>, <token_object>)` - returns list of payments for specific account

`setupAccount(<bank_credentials>, <token_object>)` - returns task token which should be used for `http://api.figo.me/task/start?id=<task token>` to fire the task
