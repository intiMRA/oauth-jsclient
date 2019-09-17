
$(document).ready(function(e) {

    $("#edit-comp").click(()=>{
        $('#edit').dialog('open');
    });
    $('#edit').dialog({
        modal : true, autoOpen : false,
        buttons : {
            "Submit" : function () {
                $.post('/data', {},function (data,response) {
                    console.log(data);
                    $(this).dialog('close');
                });



            },
            "Cancel" : function () { $(this).dialog('close'); }
        }
    });

    function authorizeUri() {

        $.get('/authUri', function (uri) {
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

    function makeQuery(){

        var q=$('#q').val();

        $.ajax({
            method:"POST",
            url:"/query",
            data:{q:q}
        }).success((d)=>{
            console.log(JSON.stringify(d));
            $("#queryres").html('<p>'+JSON.stringify(d)+'</p>');
        }).error((e)=>{
            console.log(JSON.stringify(e));
            $("#queryres").html('<p>'+JSON.stringify(e)+'</p>');
        });
    }

    function makeAPICall() {
        $.get('/getCompanyInfo', function (response) {
            var isEmpty=(obj)=>{
                for(var key in obj) {
                    if(obj.hasOwnProperty(key))
                        return false;
                }
                return true;
            };
            var companyName=response.CompanyInfo.CompanyName;
            var companyLegalName=response.CompanyInfo.LegalName;
            var addres=response.CompanyInfo.LegalAddr;
            var comAddress=response.CompanyInfo.CustomerCommunicationAddr;
            var city=comAddress.City;
            var satate=comAddress.CountrySubDivisionCode;
            var email=response.CompanyInfo.Email.Address;
            var phone=isEmpty(response.CompanyInfo.PrimaryPhone)?"no phone present" :JSON.stringify(response.CompanyInfo.PrimaryPhone);
            var webpage=isEmpty(response.CompanyInfo.WebAddr)?"not webpage present" :JSON.stringify(response.CompanyInfo.WebAddr);
            var compHtml = '<form><h1>Company Info</h1>';
            compHtml += '<p> <b>Company Name: </b>'+companyName+'</p>';
            compHtml += '<p> <b>Company Legal Name: </b>'+companyLegalName+'</p>';
            compHtml += '<p> <b>Company City: </b>'+city+","+ satate+'</p>';
            compHtml += '<p> <b>Company Email: </b>'+email+'</p>';
            compHtml += '<p> <b>Company phone: </b>'+phone+'</p>';
            compHtml += '<p> <b>Company Webpage: </b>'+webpage+'</p>';
            $("#apiCall").html(compHtml);
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



    document.getElementById('queryBtn').addEventListener('click',function response(e) {
        e.preventDefault();
        makeQuery();
    });

});