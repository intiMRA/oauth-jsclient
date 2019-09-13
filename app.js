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

    oauthClient.makeApiCall({url: url + 'v3/company/' + companyID +'/companyinfo/' + companyID})
        .then(function(authResponse){
            console.log("The response for API call is :"+JSON.stringify(authResponse));
            res.send(JSON.parse(authResponse.text()));
        })
        .catch(function(e) {
            console.error(e);
        });
});

/**
 * disconnect ()
 */
app.get('/disconnect', function(req,res){

  console.log('The disconnect called ');
  const authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.OpenId,OAuthClient.scopes.Email],state:'intuit-test'});
  res.redirect(authUri);

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

