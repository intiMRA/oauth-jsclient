'use strict';

require('dotenv').config();


/**
 * Require the dependencies
 * @type {*|createApplication}
 */
const express = require('express');
const app = express();
const path = require('path');
const OAuthClient = require('intuit-oauth');
const bodyParser = require('body-parser');
const ngrok =  (process.env.NGROK_ENABLED==="true") ? require('ngrok'):null;
var pjson = require('./package.json');
var os = require('os');
/**
 * Configure View and Handlebars
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());


const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * App Variables
 * @type {null}
 */
let oauth2_token_json = null,
    redirectUri = '';


/**
 * Instantiate new Client
 * @type {OAuthClient}
 */

let oauthClient = null;


/**
 * Home Route
 */
app.get('/', function(req, res) {

    res.render('index');
});

/**
 * Get the AuthorizeUri
 */
app.get('/authUri', urlencodedParser, function(req,res) {
    oauthClient = new OAuthClient({
        clientId: 'ABM90qJ9fSD29O8cGmdymFod6ddcNOhVNQBZTV5stey8feEpOL',
        clientSecret: 'z7o8Ptm26m10D5x8G9M5FAzxOMcUvO0DGKu2SSf0',
        environment: 'sandbox',
        redirectUri: 'http://localhost:8080/callback'
    });

    const authUri = oauthClient.authorizeUri({scope:['com.intuit.quickbooks.accounting'],state:'intuit-test'});
    res.send(authUri);
});


/**
 * Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
 */
app.get('/callback', function(req, res,next) {

    oauthClient.createToken(req.url)
        .then(function(authResponse) {
            const oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
            res.redirect("/");
        })
        .catch(function(e) {
            console.error(e);
            next(e);
        });



});
/**
 * Display the token : CAUTION : JUST for sample purposes
 */
app.get('/retrieveToken', function(req, res) {
    res.send(oauth2_token_json);
});


/**
 * Refresh the access-token
 */
app.get('/refreshAccessToken', function(req,res){

    oauthClient.refresh()
        .then(function(authResponse){
            console.log('The Refresh Token is  '+ JSON.stringify(authResponse.getJson()));
            oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
            res.send(oauth2_token_json);
        })
        .catch(function(e) {
            console.error(e);
        });


});

/**
 * getCompanyInfo ()
 */
app.get('/getCompanyInfo', function(req,res){


    const companyID = oauthClient.getToken().realmId;

    const url = oauthClient.environment === 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production ;
    var Client = require('node-rest-client').Client;
    var args={headers: {
            "Authorization": 'Bearer ' + oauthClient.getToken().access_token,
            'Accept': "application/json",
            'User-Agent': 'Intuit-OAuthClient-JS'+ '_' + pjson.version + '_' + os.type() + '_' + os.release() + '_' + os.platform()
        }
    };
    var client = new Client();
    client.get(url + 'v3/company/' + companyID +'/companyinfo/' + companyID,args, function (data, response) {
        // parsed response body as js object
        res.send(data);
    });

    // oauthClient.makeApiCall({url: url + 'v3/company/' + companyID +'/companyinfo/' + companyID})
    //     .then(function(authResponse){
    //         res.send(JSON.parse(authResponse.text()));
    //     })
    //     .catch(function(e) {
    //         console.error(e);
    //     });
});

app.post('/data',async function (req,res) {
    const companyID = oauthClient.getToken().realmId;
    var url = oauthClient.environment === 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production ;

    var Client = require('node-rest-client').Client;

    var client = new Client();
    var argsGet={headers: {
            "Authorization": 'Bearer ' + oauthClient.getToken().access_token,
            'Accept': "application/json",
            'User-Agent': 'Intuit-OAuthClient-JS'+ '_' + pjson.version + '_' + os.type() + '_' + os.release() + '_' + os.platform()
        }
    };
    var syncToken=0;
    client.get(url + 'v3/company/' + companyID +'/companyinfo/' + companyID,argsGet, function (data, response) {
        // parsed response body as js object
        syncToken=data.CompanyInfo.SyncToken;
        console.log(syncToken);
        var args = {
            data:{
                SyncToken: syncToken,
                domain: "QBO",
                LegalAddr: {
                    City: "Mountain View",
                    Country: "US",
                    Line1: "2500 Garcia Ave",
                    PostalCode: "94043",
                    CountrySubDivisionCode: "CA",
                    Id: 1
                },
                SupportedLanguages: "en",
                CompanyName: "Larry's Bakery",
                Country: "US",
                CompanyAddr: {
                    City: "Mountain View",
                    Country: "US",
                    Line1: "2500 Garcia Ave",
                    PostalCode: "94043",
                    CountrySubDivisionCode: "CA",
                    Id: 1
                },
                sparse: false,
                Id: 1,
                WebAddr: {
                    URI:"https://colabs.com"
                },
                FiscalYearStartMonth: "January",
                CustomerCommunicationAddr: {
                    City: "Mountain View",
                    Country: "US",
                    Line1: "2500 Garcia Ave",
                    PostalCode: 94043,
                    CountrySubDivisionCode: "CA",
                    Id: 1
                },
                PrimaryPhone: {
                    FreeFormNumber: "(650)944-4444"
                },
                LegalName: "Larry's Bakery",
                CompanyStartDate: "2015-06-05",
                Email: {
                    Address: "donotreply@intuit.com"
                },
                NameValue: [
                    {
                        Name: "NeoEnabled",
                        Value: true
                    },
                    {
                        Name: "IndustryType",
                        Value: "Bread and Bakery Product Manufacturing"
                    },
                    {
                        Name: "IndustryCode",
                        Value: "31181"
                    },
                    {
                        Name: "SubscriptionStatus",
                        Value: "PAID"
                    },
                    {
                        Name: "OfferingSku",
                        Value: "QuickBooks Online Plus"
                    },
                    {
                        Name: "PayrollFeature",
                        Value: true
                    },
                    {
                        Name: "AccountantFeature",
                        Value: false
                    }
                ],
                MetaData: {
                    CreateTime: "2015-06-05T13:55:54-07:00",
                    LastUpdatedTime: "2015-07-06T08:51:50-07:00"
                }
            },
            headers: {
                "Authorization": 'Bearer ' + oauthClient.getToken().access_token,
                'Content-Type':"application/json",
                'Accept': "application/json",
                'User-Agent': 'Intuit-OAuthClient-JS'+ '_' + pjson.version + '_' + os.type() + '_' + os.release() + '_' + os.platform()
            }
        };

        client.post(url + 'v3/company/' + companyID+'/companyinfo/', args, function (data, response) {
            // parsed response body as js object
            console.log(JSON.stringify(data));
            res.send(data);
        });
    });
// set content-type header and data as json in args parameter

});

/**
 * disconnect ()
 */
app.get('/disconnect', function(req,res){

  console.log('The disconnect called ');
  const authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.OpenId,OAuthClient.scopes.Email],state:'intuit-test'});
  res.redirect(authUri);

});


app.post('/query', function(req,res){
    console.log("coke",req.body);
    const companyID = oauthClient.getToken().realmId;

    const url = oauthClient.environment === 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production ;
    var Client = require('node-rest-client').Client;
    var args={headers: {
            "Authorization": 'Bearer ' + oauthClient.getToken().access_token,
            'Accept': "application/json",
            'User-Agent': 'Intuit-OAuthClient-JS'+ '_' + pjson.version + '_' + os.type() + '_' + os.release() + '_' + os.platform()
        }
    };
    var client = new Client();
    client.get(url + 'v3/company/' + companyID +'/query?query='+req.body.q,args, function (data, response) {
        // parsed response body as js object
        console.log(JSON.stringify(data));

        res.send(data);
    });

});


/**
 * Start server on HTTP (will use ngrok for HTTPS forwarding)
 */
const server = app.listen(process.env.PORT || 8080, () => {
    console.log(`Server listening on port ${server.address().port}!`);

});

/**
 * Optional : If NGROK is enabled
 */
if (ngrok) {

    console.log("NGROK Enabled");
    ngrok.connect({addr: process.env.PORT || 8080}, (err, url) => {
            if (err) {
                process.exit(1);
            }
            else {
                redirectUri = 'http://localhost:8080?action=oauth_callback';

            }
        }
    );
}

