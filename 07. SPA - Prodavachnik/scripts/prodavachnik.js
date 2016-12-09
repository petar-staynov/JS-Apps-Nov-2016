function startApp() {
        sessionStorage.clear();

        //Initial page view

    menuViewer(); //Runs menu viewer function
    pageViewer('viewHome'); //Loads viewHome aka Welcome page

    //Navigation menu buttons
    $('#linkHome').click(showHome);
    $('#linkLogin').click(showLogin);
    $('#linkRegister').click(showRegister);
    $('#linkListAds').click(listAds);
    $('#linkCreateAd').click(showCreateAd);
    $('#linkLogout').click(logout);

    //Submit button binds
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateAd").click(createAd);
    $("#buttonEditAd").click(editAd);

    //Loading/Info/Error boxes hiding
    $('#infoBox, #errorBox, #loadingBox').click(function () {
        $(this).hide();
    });

    //AJAX - loading box event listener
    $(document).on({
       ajaxStart: function () {
           $('#loadingBox').show()
       },
        ajaxStop: function () {
            $('#loadingBox').hide()
        }
    });

    //Kinvey data
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_BkNpPO2Ml';
    const appSecret = '572fc2a7dbd5474eb19cf4297391b2dc';
    const authHeaders = {'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret)};
    
    //Functions
    function menuViewer() {
        $('#menu a').hide();
        //If user is logged in show certain menus
        if(sessionStorage.getItem('authToken')){
            $('#linkHome').show();
            $('#linkListAds').show();
            $('#linkCreateAd').show();
            $('#linkLogout').show();
        }
        //If user is not logged in hide certain menus
        else {
            $('#linkHome').show();
            $('#linkLogin').show();
            $('#linkRegister').show();
        }
    }
    function pageViewer(view) {
        //Shows only certain view
        $('main > section').hide();
        $('#' + view).show();
    }
    function showHome() {
        pageViewer('viewHome');
    }
    function showLogin() {
        $('#formLogin').trigger('reset');
        pageViewer('viewLogin')

    }
    function showRegister() {
        $('#formRegister').trigger('reset');
        pageViewer('viewRegister')

    }
    function listAds() {
        pageViewer('viewAds')
    }
    function showCreateAd() {
        pageViewer('viewCreateAd')
    }
    function logout() {
        sessionStorage.clear();
        $('#loggedInUser').text('');
        pageViewer('viewHome');
        menuViewer();
        showInfo('Logout successful.');
    }
    ////////////////////////////////////
    ////////////////////////////////////
    function loginUser() {
        function saveAuthInSession(userInfo) {
            let userAuth = userInfo._kmd.authtoken;
            sessionStorage.setItem('authToken', userAuth);
            let userId = userInfo._id;
            sessionStorage.setItem('userId', userId);
            let username = userInfo.username;
            $('#loggedInUser').text(`Welcome, ${username} !`);

            return username
        }
        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            menuViewer();
            listAds();
            showInfo('User login successful.')
        }

        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };
        $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + appKey + '/login',
            headers: authHeaders,
            data: userData,
            success: loginSuccess,
            error: ajaxError
        });

    }
    function registerUser() {
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };
        $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + appKey + '/',
            headers: authHeaders,
            data: userData,
            success: registerSuccess,
            error: ajaxError
        });
        function registerSuccess(userInfo) {
            menuViewer();
            showInfo('User registration successful. Please log in');
            $('#formRegister').trigger('reset');
        }

    }
    function userAuthHeaders() {
        return {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };
    }
    function createAd() {
        event.preventDefault();

        let adData = {
            title: $('#formCreateAd input[name=title]').val(),
            publisher: sessionStorage.getItem('username'),
            description: $('#formCreateAd textarea[name=description]').val(),
            date: $('#formCreateAd input[name=datePublished]').val(),
            price: $('#formCreateAd input[name=price]').val()
        };
        $.ajax({
            method:"POST",
            url: baseUrl+'appdata/'+appKey+'/ads',
            data: adData,
            headers: getUserHeaders(),
            success: createAdSuccess,
            error: ajaxError
        });
        function createAdSuccess(){
            listAds();
            showInfo('Ad created.');
        }
    }
    function editAd(){
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
            url: baseUrl+'appdata/'+ appKey +'/ads/'+id,
            headers:getUserHeaders(),
            data:adData,
            success: editAdSuccess,
            error: ajaxError,
        });
        function editAdSuccess(){
            listAds();
            showInfo('Advertisment edited.')
        }

    }
    function loadAdForEdit(ad){
        $('#formEditAd input[name=id]').val(ad._id);
        $('#formEditAd input[name=publisher]').val(ad.publisher);
        $('#formEditAd input[name=title]').val(ad.title);
        $('#formEditAd textarea[name=description]').val(ad.description);
        $('#formEditAd input[name=datePublished]').val(ad.date);
        $('#formEditAd input[name=price]').val(ad.price);

        pageViewer('viewEditAd');
    }
    function deleteAd(ad) {
        $.ajax({
            method:"DELETE",
            url: baseUrl+'appdata/'+appKey+'/ads/'+ad._id,
            headers:getUserHeaders(),
            success: deleteAdSuccess,
            error: ajaxError
        });

        function deleteAdSuccess(){
            showInfo('Ad deleted.');
            listAds();
        }
    }
    ////////////////////////////////////
    ////////////////////////////////////
    function listAds(){
        $('#ads').empty();
        pageViewer('viewAds');
        $.ajax({
            method:"GET",
            url: baseUrl+'appdata/'+appKey+'/ads',
            headers:getUserHeaders(),
            success: listAdsSuccess,
            error: ajaxError
        });
    }

    function listAdsSuccess(ads){
        showInfo('Ads loaded.');

        if (ads.length == 0) {
            $('#ads').text('No ads in the library.');
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
    ////////////////////////////////////
    ////////////////////////////////////
    function ajaxError(response) {
        //Gets AJAX error data and sends it to showInfo
        let errorMessage = JSON.stringify(response);
        if (response.readyState === 0){
            errorMessage = 'Network error';
        }
        else if (response.responseJSON && response.responseJSON.description){
            errorMessage = response.responseJSON.description;
        }
        showError(errorMessage);
    }
    function showInfo(message) {
        //Displays message in info box
        $('#infoBox').text(message);
        $('#infoBox').show();
    }
    function showError(errorMessage) {
        //Displays error in info box
        $('#errorBox').text(`Error ${errorMessage}`);
        $('#errorBox').show();
    }
    function getUserHeaders(){
        return {
            Authorization:'Kinvey ' + sessionStorage.getItem('authToken')
        }
    }
}