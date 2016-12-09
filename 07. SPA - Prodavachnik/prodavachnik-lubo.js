function startApp() {
    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');

    $('#linkHome').click(showHomeView);
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView);
    $('#linkListAds').click(listAds);
    $('#linkCreateAd').click(showCreateAd);
    $('#linkLogout').click(logoutUser);
    $('#formRegister').submit(registerUser);
    $('#formLogin').submit(loginUser);
    $('#formCreateAd').submit(createAd);
    $('#formEditAd').submit(editAd);

    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });

    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_HJ5LD9Vzg";
    const kinveyAppSecret =
        "a66cc5d402754216a2c6b87cf94838f5";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " +
        btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };
    function showHomeView(){
        showView('viewHome');
    }

    function showLoginView(){
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }

    function showRegisterView(){
        showView('viewRegister');
        $('#formRegister').trigger('reset');
    }

    function listAds(){
        $('#ads').empty();
        showView('viewAds');
        $.ajax({
            method:"GET",
            url:kinveyBaseUrl+'appdata/'+kinveyAppKey+'/adverts',
            headers:getUserHeaders()
        }).then(listAdsSuccess).catch(handleAjaxError);
    }

    function listAdsSuccess(ads){
        showInfo('Advertisments loaded.');

        if (ads.length == 0) {
            $('#ads').text('No advertisments in the library.');
        }
        else {
            let adsTable = $('<table>')
                .append($('<tr>').append(
                    '<th>Title</th><th>Publisher</th>',
                    '<th>Description</th><th>Price</th><th>Date Published</th>' +
                    '<th>Actions</th>'));
            for (let ad of ads)
                appendAdRow(ad, adsTable);
            $('#ads').append(adsTable);
        }

        function appendAdRow(ad, adsTable) {
            let links = [];

            if(ad._acl.creator == sessionStorage['userId']){
                let deleteLink = $('<a href="#">[Delete]</a>').click(function () {deleteAd(ad)});
                let editLink = $('<a href="#">[Edit]</a>').click(function () {loadAdForEdit(ad)});
                links = [deleteLink,' ',editLink];
            }

            adsTable.append($('<tr>').append(
                $('<td>').text(ad.title),
                $('<td>').text(ad.publisher),
                $('<td>').text(ad.description),
                $('<td>').text(ad.price),
                $('<td>').text(ad.date),
                $('<td>').append(links)
            ));
        }
    }

    function showCreateAd(){
        showView('viewCreateAd');
        $('#formCreateAd').trigger('reset');
    }

    function logoutUser(){
        sessionStorage.clear();

        $('#loggedInUser').hide();

        showView('viewHome');

        showHideMenuLinks();
    }

    function registerUser(){
        event.preventDefault();
        let userData = {
            username:$('#formRegister input[name=username]').val(),
            password:$('#formRegister input[name=passwd]').val()
        };
        $.ajax({
            method:"POST",
            url:kinveyBaseUrl+'user/'+kinveyAppKey,
            headers: kinveyAppAuthHeaders,
            data:userData
        }).then(resigterSuccess).catch(handleAjaxError);
        function resigterSuccess(userInfo){
            saveAuthInSession(userInfo);
            showView('viewHome');
            showHideMenuLinks();
            showInfo('Registration successful.')
        }
    }

    function loginUser(){
        event.preventDefault();

        let userData = {
            username:$('#formLogin input[name=username]').val(),
            password:$('#formLogin input[name=passwd]').val()
        };

        $.ajax({
            method:"POST",
            url:kinveyBaseUrl+'user/'+kinveyAppKey+'/login',
            headers: kinveyAppAuthHeaders,
            data:userData
        }).then(loginSuccess).catch(handleAjaxError);
        function loginSuccess(userInfo){
            saveAuthInSession(userInfo);
            showView('viewHome');
            showHideMenuLinks();
            showInfo('Login successful.')
        }
    }

    function createAd(){
        event.preventDefault();
        let title = $('#formCreateAd input[name=title]').val();
        let publisher = sessionStorage.getItem('username');
        let description = $('#formCreateAd textarea[name=description]').val();
        let date = $('#formCreateAd input[name=datePublished]').val();
        let price = $('#formCreateAd input[name=price]').val();
        let adData = {
            title,
            publisher,
            description,
            date,
            price
        };
        $.ajax({
            method:"POST",
            url:kinveyBaseUrl+'appdata/'+kinveyAppKey+'/adverts',
            data:adData,
            headers: getUserHeaders()
        }).then(createAdSuccess).catch(handleAjaxError);
        function createAdSuccess(){
            listAds();
            showInfo('Advertisment created.');
        }
    }

    function editAd(){
        event.preventDefault();

        let id = $('#formEditAd input[name=id]').val();
        let title = $('#formEditAd input[name=title]').val();
        let publisher = sessionStorage.getItem('username');
        let description = $('#formEditAd textarea[name=description]').val();
        let date = $('#formEditAd input[name=datePublished]').val();
        let price = $('#formEditAd input[name=price]').val();

        let adData = {
            title,
            publisher,
            description,
            date,
            price
        };

        $.ajax({
            method:"PUT",
            url:kinveyBaseUrl+'appdata/'+kinveyAppKey+'/adverts/'+id,
            headers:getUserHeaders(),
            data:adData
        }).then(editAdSuccess).catch(handleAjaxError);

        function editAdSuccess(){
            listAds();
            showInfo('Advertisment edited.')
        }

    }

    function saveAuthInSession(userInfo){
        sessionStorage.setItem('authToken',userInfo._kmd.authtoken);
        sessionStorage.setItem('username',userInfo.username);
        sessionStorage.setItem('userId',userInfo._id);
        $('#loggedInUser').show().text('Welcome, ' + userInfo.username + '!');
    }

    function handleAjaxError(response){
        let errorMsg = JSON.stringify(response);

        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";

        if (response.responseJSON &&
            response.responseJSON.description)
            errorMsg = response.responseJSON.description;

        showError(errorMsg);
    }

    function showInfo(info){
        $('#infoBox').text(info);
        $('#infoBox').show();
        setInterval(function () {
            $('#infoBox').hide();
        },2000)
    }

    function showError(error){
        $('#errorBox').text(error);
        $('#errorBox').show();
        setInterval(function () {
            $('#errorBox').hide();
        },2000)
    }

    function getUserHeaders(){
        return {
            Authorization:'Kinvey ' + sessionStorage.getItem('authToken')
        }
    }

    function deleteAd(ad){
        $.ajax({
            method:"DELETE",
            url:kinveyBaseUrl+'appdata/'+kinveyAppKey+'/adverts/'+ad._id,
            headers:getUserHeaders()
        }).then(deleteAdSuccess).catch(handleAjaxError);

        function deleteAdSuccess(){
            showInfo('Advertisment deleted.');
            listAds();
        }
    }

    function loadAdForEdit(ad){
        $('#formEditAd input[name=id]').val(ad._id);
        $('#formEditAd input[name=publisher]').val(ad.publisher);
        $('#formEditAd input[name=title]').val(ad.title);
        $('#formEditAd textarea[name=description]').val(ad.description);
        $('#formEditAd input[name=datePublished]').val(ad.date);
        $('#formEditAd input[name=price]').val(ad.price);

        showView('viewEditAd');
    }

    function showView(view){
        $('main section').hide();
        $('#'+view).show();
    }

    function showHideMenuLinks(){
        $('#menu a').hide();
        if(sessionStorage.getItem('authToken')){
            $('#linkHome').show();
            $('#linkListAds').show();
            $('#linkCreateAd').show();
            $('#linkLogout').show();
        }
        else{
            $('#linkHome').show();
            $('#linkLogin').show();
            $('#linkRegister').show();
        }
    }

}