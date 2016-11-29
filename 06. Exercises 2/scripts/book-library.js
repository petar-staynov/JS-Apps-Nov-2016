function startApp() {
    //Clears auth data
    sessionStorage.clear();

    //Page view
    showHideMenuLinks();
    showView('viewHome');


    //Navigation menu binds
    $('#linkHome').click(showHomeView);
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView);
    $('#linkListBooks').click(listBooks);
    $('#linkCreateBook').click(showCreateBookView);
    $('#linkLogout').click(logoutUser);

    //Submit buttons bind
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateBook").click(createBook);
    $("#buttonEditBook").click(editBook);

    //Messages hide on click
    // $('#infoBox, #errorBox').click(function () {
    //     this.fadeOut();
    // });

    //AJAX loading event listener
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
    const appKey = 'kid_r1MPbmqze';
    const appSecret = '498af5c831cc4c868d2e5c726ede86d7';
    const authHeaders = {'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret)};

    //FUNCTIONS
    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0){
            errorMsg = "Cannot connect due to network error.";

        }
        if (response.responseJSON && response.responseJSON.description){
            errorMsg = response.responseJSON.description;
        }
        showError(errorMsg);
    }
    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function() {
            $('#infoBox').fadeOut();
        }, 3000);
    }
    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }

    function showHideMenuLinks() {
        $('#menu a').hide();

        if(sessionStorage.getItem('authToken')){
            //Logged in user
            $('#linkHome').show();
            $('#linkListBooks').show();
            $('#linkCreateBook').show();
            $('#linkLogout').show();
        }
        else {
            //not logged in
            $('#linkHome').show();
            $('#linkLogin').show();
            $('#linkRegister').show();
        }
    }
    function showView(viewName) {
        //Hide all views and show selected view only
        $('main > section').hide();
        $('#' + viewName).show();
        
    }
    function showHomeView() {
        showView('viewHome')
    }
    function showLoginView() {
        // sessionStorage.setItem('authToken', 'asdasd');  //TODO remove
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }
    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }
    function userAuthHeaders() {
        return {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };
    }
    function listBooks() {
         $('#books').empty();
        showView('viewBooks');

        $.ajax({
            method: 'GET',
            url: baseUrl + 'appdata/' + appKey + '/books',
            headers: userAuthHeaders(),
            success: loadBooksSuccess,
            error: handleAjaxError
        });
        function loadBooksSuccess(books) {
            showInfo('Books loaded.');
            if (books.length == 0) {
                $('#books').text('No books in the library.');
            }
            else {
                let booksTable = $('<table>')
                    .append($('<tr>')
                        .append('<th>Title</th><th>Author</th>','<th>Description</th><th>Actions</th>'));
                for (let book of books){
                    appendBookRow(book, booksTable);
                }
                $('#books').append(booksTable);
            }
            function appendBookRow(book, booksTable) {
                let links = [];
                if (book._acl.creator == sessionStorage['userId']) {
                    let deleteLink = $('<a href="#">[Delete]</a>').click(deleteBook.bind(this, book));
                    let editLink = $('<a href="#">[Edit]</a>').click(loadBookForEdit.bind(this, book));
                    links = [deleteLink, ' ', editLink];
                }
                booksTable.append($('<tr>').append(
                    $('<td>').text(book.title),
                    $('<td>').text(book.author),
                    $('<td>').text(book.description),
                    $('<td>').append(links)
                ));
                function deleteBook(book) {
                    $.ajax({
                        method: "DELETE",
                        url: kinveyBookUrl = baseUrl + "appdata/" + appKey + "/books/" + book._id,
                        headers: userAuthHeaders(),
                        success: deleteBookSuccess,
                        error: handleAjaxError

                    });
                    function deleteBookSuccess(response) {
                        listBooks();
                        showInfo('Book deleted.');
                    }
                }
            }

        }
    }
    function showCreateBookView() {
        $('#formCreateBook').trigger('reset');
        showView('viewCreateBook');
    }
    function logoutUser() {
        sessionStorage.clear();
        $('#loggedInUser').text('');
        showView('viewHome');
        showHideMenuLinks();
        showInfo('Logout successful.');
    }
    function loginUser() {
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
            error: handleAjaxError
        });
        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('User login successful.')
        }
        function saveAuthInSession(userInfo) {
            let userAuth = userInfo._kmd.authtoken;
            sessionStorage.setItem('authToken', userAuth);
            let userId = userInfo._id;
            sessionStorage.setItem('userId', userId);
            let username = userInfo.username;
            $('#loggedInUser').text(`Welcome, ${username} !`);
        }
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
            error: handleAjaxError
        });
        function registerSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('User registration successful.')
        }
        function saveAuthInSession(userInfo) {
            let userAuth = userInfo._kmd.authtoken;
            sessionStorage.setItem('authToken', userAuth);
            let userId = userInfo._id;
            sessionStorage.setItem('userId', userId);
            let username = userInfo.username;
            $('#loggedInUser').text(`Welcome, ${username} !`);
        }
    }
    function createBook() {
        let bookData = {
            title: $('#formCreateBook input[name=title]').val(),
            author: $('#formCreateBook input[name=author]').val(),
            description: $('#formCreateBook textarea[name=descr]').val()
        };
        $.ajax({
            method: "POST",
            url: baseUrl + "appdata/" + appKey + "/books",
            headers: userAuthHeaders(),
            data: bookData,
            success: createBookSuccess,
            error: handleAjaxError
        });
        function createBookSuccess(response) {
            listBooks();
            showInfo('Book created.');
        }
    }


    function editBook() {
        let bookData = {
            title: $('#formEditBook input[name=title]').val(),
            author: $('#formEditBook input[name=author]').val(),
            description:
                $('#formEditBook textarea[name=descr]').val()
        };
        $.ajax({
            method: "PUT",
            url: baseUrl + "appdata/" + appKey + "/books/" + $('#formEditBook input[name=id]').val(),
            headers: userAuthHeaders(),
            data: bookData,
            success: editBookSuccess,
            error: handleAjaxError
        });
        function editBookSuccess(response) {
            listBooks();
            showInfo('Book edited.');
        }
    }


    function loadBookForEdit(book) {
        $.ajax({
            method: "GET",
            url: kinveyBookUrl = baseUrl + "appdata/" + appKey + "/books/" + book._id,
            headers: userAuthHeaders(),
            success: loadBookForEditSuccess,
            error: handleAjaxError
        });
        function loadBookForEditSuccess(book) {
            $('#formEditBook input[name=id]').val(book._id);
            $('#formEditBook input[name=title]').val(book.title);
            $('#formEditBook input[name=author]').val(book.author);
            $('#formEditBook textarea[name=descr]').val(book.description);
            showView('viewEditBook');
        }
    }
}