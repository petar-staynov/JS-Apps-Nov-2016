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
    $('#linklogout').click(logoutUser);

    //Submit buttons bind
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateBook").click(createBook);
    $("#buttonEditBook").click(editBook);

    
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
    function listBooks() {
        
    }
    function showCreateBookView() {
        $('#formCreateBook').trigger('reset');
        showView('viewCreateBook');
    }
    function logoutUser() {
        
    }
    function loginUser() {

    }
    function registerUser() {
        
    }
    function createBook() {
        
    }
    function editBook() {
        
    }
}