# figo-bettervest
This is the NodeJS library for connetction work with figo API https://api.figo.me/

The authorization is made for user credentials grant type only.

To use it you need to have `ClientID` and `Secret` keys issued by figo and store them in file examples.js in a project directory

First you need to invoke method `getToken(<user email>, <password>)` it will return promise for token object for access.

`getAccounts(<token object>)` - return promise for array of figo ccount objects belonged to user you logged in 
`getTransactions(<account_id>, <token_object>)` - returns promise for array of figo transaction ojects
`makePayment(<token_object>, <account_object>, <amount_integer>, <accont_object>)` - returns promise for payment object with figo ID, first account parameter is fpr sender, second is ofr receiver
`submitPayment(<payment_object>, <account_object>, <token_object>)` - sumiting payment to figo tasks pull and returns promise for a link for TAN processing (account required for obtaining TAN processing schema)
`getPayments(<account_object>, <token_object>)` - returns list of payments for specific account
