
$(document).ready(function(e) {

    function authorizeUri() {

        // Generate the authUri
        var jsonBody = {};
        jsonBody.clientId = $('#clientId').val();
        jsonBody.clientSecret = $('#clientSecret').val();
        jsonBody.environment = $('#environment').val();
        jsonBody.redirectUri = $('#redirectUri').val();

        $.get('/authUri', {json:jsonBody}, function (uri) {
            console.log('The Auth Uris is :'+uri);
        })
            .then(function (authUri) {
                window.location=authUri;
            });
    }

    function retrieveToken() {

        // Generate the authUri
        $.get('/retrieveToken', function (token) {
            var token = (token!=null) ? token : 'Please Authorize Using Connect to Quickbooks first !';
            $("#accessToken").html(token);
        });
    }

    function refreshToken() {

        // Generate the authUri
        $.get('/refreshAccessToken', function (token) {
            var token = (token!=null) ? token : 'Please Authorize Using Connect to Quickbooks first !';
            $("#accessToken").html(token);
        });
    }

    function makeAPICall() {

        // Generate the authUri
        $.get('/getCompanyInfo', function (response) {
            $("#apiCall").html(JSON.stringify(response, null, 4));
        });
    }

    document.getElementById('authorizeUri').addEventListener('click', function response(e) {
        e.preventDefault();
        authorizeUri();
    });

    document.getElementById('retrieveToken').addEventListener('click', function response(e) {
        e.preventDefault();
        retrieveToken();
    });

    document.getElementById('refreshToken').addEventListener('click', function response(e) {
        e.preventDefault();
        refreshToken();
    });

    document.getElementById('makeAPICall').addEventListener('click', function response(e) {
        e.preventDefault();
        makeAPICall();
    });

});