/* Here's users to test things:
* Kinvey-created user:
* username: admin
* password: admin
*
* Registered escape user:
* username: <peter><br>
* password: 1234
*
* Registered normal user:
* username: user2
* password: user2
* name: NewUser
*
* Views - Working
* Login - Working
* Register - Working
* Logout - Working
* View my received messages - Working
* Message date - Working
* Send private message - Working
* Delete message - Working
* View my sent messages - Working
*/
function startApp() {
    sessionStorage.clear();
    showHideMenuLinks();
    hideBoxes();
    showView('viewAppHome');

    //Box hide on click
    $('#infoBox').click(function () {
        $('#infoBox').fadeOut()
    });
    $('#errorBox').click(function () {
        $('#errorBox').fadeOut()
    });

    //Anonymous menu
    $('#linkMenuAppHome').click(showAppHomeView);
    $('#linkMenuLogin').click(showLoginView);
    $('#linkMenuRegister').click(showRegisterView);

    //User specific menu
    $('#linkMenuUserHome').click(showUserHome);
    $('#linkMenuMyMessages').click(showUserMessages);
    $('#linkMenuArchiveSent').click(showArchiveSent);
    $('#linkMenuSendMessage').click(showSendMessage);
    $('#linkMenuLogout').click(userLogout);

    //User page links
    $('#linkUserHomeMyMessages').click(showUserMessages);
    $('#linkUserHomeSendMessage').click(showSendMessage);
    $('#linkUserHomeArchiveSent').click(showArchiveSent);

    //Forms
    $('#formRegister').submit(userRegister);
    $('#formLogin').submit(userLogin);
    $('#formSendMessage').submit(sendMessage);

    //Loading box AJAX listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").fadeOut() }
    });


    //Kinvey data
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_BJw0vOcQx";
    const kinveyAppSecret = "2807b8ce4f6d40b8b344563886fb5c12";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " +
        btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };

    //ADMIN BUTTON//
    // let adminBtn = $('<button>').prop('id', 'adminBtn').text('ADMIN');
    // $('#menu').append(adminBtn);
    // $('#adminBtn').click(function () {
    //     console.log(sessionStorage.getItem('authToken'));
    //     console.log(sessionStorage.getItem('username'));
    //     console.log(sessionStorage.getItem('name'));
    //
    // });


    //////////////////////VIEW CONTROL///////////////////
    function showView(view) {
        $('main section').hide();
        $('#'+view).show();
    }
    function showAppHomeView() {
        showView('viewAppHome');
    }
    function showLoginView() {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }
    function showRegisterView() {
        showView('viewRegister');
        $('#formRegister').trigger('reset');
    }
    function showUserHome() {
        showView('viewUserHome');

    }
    function showUserMessages() {
        showView('viewMyMessages');

        $('#myMessages tbody').empty();

        $.ajax({
            method: 'GET',
            url: kinveyBaseUrl + 'appdata/' + kinveyAppKey + '/messages',
            headers: getKinveyUserAuthHeaders(),
        })
            .then(listUserReceivedMessagesSuccess)
            .catch(handleAjaxError);

        function listUserReceivedMessagesSuccess(messages) {
            for (let message of messages) {
                if (message.recipient_username == sessionStorage.getItem('username')){
                    let messageRow = $('<tr>');
                    messageRow.append($('<td>').text(formatSender(message.sender_name, message.sender_username)));
                    messageRow.append($('<td>').text(message.text));
                    messageRow.append($('<td>').text(formatDate(message._kmd.lmt)));
                    $('#myMessages tbody').append(messageRow);
                }
            }
        }
    }
    function showArchiveSent() {
        showView('viewArchiveSent');
        $('#sentMessages tbody').empty();

        $.ajax({
            method: 'GET',
            url: kinveyBaseUrl + 'appdata/' + kinveyAppKey + '/messages',
            headers: getKinveyUserAuthHeaders(),
        })
            .then(listUserSentMessagesSuccess)
            .catch(handleAjaxError);

        function listUserSentMessagesSuccess(messages) {

            for (let message of messages) {
                // console.log(message);
                if (message.sender_username == sessionStorage.getItem('username')) {
                    let messageRow = $('<tr>');
                    messageRow.append($('<td>').text(message.recipient_username));
                    messageRow.append($('<td>').text(message.text));
                    messageRow.append($('<td>').text(formatDate(message._kmd.lmt)));
                    messageRow.append($('<td>').append($('<button>').text('Delete').click(function () {deleteMessage(message)})));
                    $('#sentMessages tbody').append(messageRow);
                }
            }
            function deleteMessage(msg) {
                $.ajax({
                    method:"DELETE",
                    url: kinveyBaseUrl + 'appdata/' + kinveyAppKey + '/messages/' + msg._id,
                    headers: getKinveyUserAuthHeaders()
                })
                    .then(deleteMessagesuccess)
                    .catch(handleAjaxError);

                function deleteMessagesuccess(){
                    showArchiveSent();
                    showInfo('Message deleted.');
                }
            }
        }
    }
    function showSendMessage() {
        showView('viewSendMessage');
        $('#formSendMessage').trigger('reset');
        $('#msgRecipientUsername').empty();

        $.ajax({
            method: 'GET',
            url: kinveyBaseUrl + 'user/' + kinveyAppKey,
            headers: getKinveyUserAuthHeaders(),
        })
            .then(listUsersSuccess)
            .catch(handleAjaxError);

        function listUsersSuccess(users) {
            for (let user of users) {
                let userOption = $('<option>');
                userOption.prop('value', user.username);
                userOption.text(formatSender(user.username, user.name));
                $('#msgRecipientUsername').append(userOption);
            }
        }
    }
    function sendMessage() {
        event.preventDefault();
        let recipient = $('#msgRecipientUsername option:selected').attr('value');
        let msgText = $('#msgText').val();

        let senderName = sessionStorage.getItem('name');
        if (senderName == 'undefined') senderName = null;

        let msgData = {
            sender_username: sessionStorage.getItem('username'),
            sender_name: sessionStorage.getItem('name'),
            recipient_username: recipient,
            text: msgText,
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + 'appdata/' + kinveyAppKey+ '/messages',
            data: msgData,
            headers: getKinveyUserAuthHeaders()
        })
            .then(messageSendSuccess)
            .catch(handleAjaxError);

        function messageSendSuccess(){
            showArchiveSent();
            showInfo('Message sent');
        }
    }
    function showInfo(info){
        $('#infoBox').text(info);
        $('#infoBox').show();
        setInterval(function () {
            $('#infoBox').fadeOut();
        },3000)
    }

    function showError(error){
        $('#errorBox').text(error);
        $('#errorBox').show();
    }
    function showHideMenuLinks(){
        $('#menu a').hide();
        if(sessionStorage.getItem('authToken')){
            $('#linkMenuUserHome').show();
            $('#linkMenuMyMessages').show();
            $('#linkMenuArchiveSent').show();
            $('#linkMenuSendMessage').show();
            $('#linkMenuLogout').show();
            $('#spanMenuLoggedInUser').show();
        }
        else{
            $('#linkMenuAppHome').show();
            $('#linkMenuLogin').show();
            $('#linkMenuRegister').show();
            $('#spanMenuLoggedInUser').hide();
        }
    }
    function hideBoxes() {
        $('#errorBox, #infoBox, #loadingBox').hide();
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
    //////////////////////////////////////////////////////
    //////////////////////USER CONTROL////////////////////
    //////////////////////////////////////////////////////
    function userLogin() {
        event.preventDefault();

        let userData = {
            username:$('#formLogin input[name=username]').val(),
            password:$('#formLogin input[name=password]').val()
        };

        $.ajax({
            method:"POST",
            url: kinveyBaseUrl + 'user/' + kinveyAppKey + '/login',
            headers: kinveyAppAuthHeaders,
            data:userData
        })
            .then(loginSuccess)
            .catch(handleAjaxError);
        function loginSuccess(userInfo){
            saveAuthInSession(userInfo);
            showUserHome();
            showHideMenuLinks();
            showInfo('Login successful.');
        }
        // console.log(userData);
    }
    function userRegister(){
        event.preventDefault();
        let userData = {
            username:$('#formRegister input[name=username]').val(),
            password:$('#formRegister input[name=password]').val(),
            name:$('#formRegister input[name=name]').val(),
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + 'user/' + kinveyAppKey,
            headers: kinveyAppAuthHeaders,
            data:userData
        })
            .then(resigterSuccess)
            .catch(handleAjaxError);
        function resigterSuccess(userInfo){
            saveAuthInSession(userInfo);
            showUserHome();
            showHideMenuLinks();
            showInfo('User registration successful');
        }
        // console.log(userData);
    }
    function saveAuthInSession(userInfo){
        sessionStorage.setItem('authToken',userInfo._kmd.authtoken);
        sessionStorage.setItem('username',userInfo.username);
        sessionStorage.setItem('name',userInfo.name);
        sessionStorage.setItem('userId',userInfo._id);
        $('#spanMenuLoggedInUser').show().text('Welcome, ' + userInfo.username + '!');
        $('#viewUserHomeHeading').text('Welcome, ' + userInfo.username + '!');

        // console.log(sessionStorage.getItem('authToken'));
        // console.log(sessionStorage.getItem('username'));
        // console.log(sessionStorage.getItem('userId'));

    }
    function userLogout() {
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/_logout",
            headers: getKinveyUserAuthHeaders(),
        })
            .then(logoutSuccessful)
            .catch(handleAjaxError);
        function logoutSuccessful() {
            sessionStorage.clear();
            $('#spanMenuLoggedInUser').hide();
            showAppHomeView();
            showHideMenuLinks();
            showInfo('Logout successful.');
        }
    }
    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };
    }
    //////////////////////////////////////////////////////
    //////////////////////BONUS FUNC/////////////////
    //////////////////////////////////////////////////////
    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }
    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }
    //////////////////////////////////////////////////////
}