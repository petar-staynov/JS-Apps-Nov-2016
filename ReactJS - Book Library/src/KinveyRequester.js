import $ from 'jquery';

let KinveyRequester = (function () {
    const app_id = 'kid_r1FJVt_Xl';
    const app_secret = '731ac6db765b414b906d42aa5aceb001';
    const baseUrl = 'https://baas.kinvey.com/';
    const authHeaders = {
        Authorization: 'Basic ' + btoa(app_id + ':' + app_secret)
    };

    function loginUser(username, password) {
        return $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + app_id + '/login',
            headers: authHeaders,
            data: {username, password}
        })
    }
    function logoutUser() {
        return $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + app_id + '/_logout',
            headers: userAuthHeaders(),
        });
    }
    function registerUser(username, password) {
        return $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + app_id,
            headers: authHeaders,
            data: {username, password}
        })
    }
    function loadBooks() {
        return $.ajax({
            method: 'GET',
            url: baseUrl + 'appdata/' + app_id + '/books',
            headers: userAuthHeaders(),
        })
    }
    function createBook(title, author, description) {
        return $.ajax({
            method: "POST",
            url: baseUrl + "appdata/" + app_id + "/books",
            headers: userAuthHeaders(),
            data: { title, author, description }
        });
    }
    function editBook(bookId, title, author, description) {
        return $.ajax({
            method: "PUT",
            url: baseUrl + "appdata/" + app_id + "/books/" + bookId,
            headers: userAuthHeaders(),
            data: { title, author, description }
        });
    }
    function findBookById(bookId) {
        return $.ajax({
            method: "GET",
            url: baseUrl + "appdata/" + app_id + "/books/" + bookId,
            headers: userAuthHeaders()
        });
    }
    function userAuthHeaders() {
        return {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        };
    }
    function deleteBook(bookId) {
        return $.ajax({
            method: "DELETE",
            url: baseUrl + "appdata/" + app_id + "/books/" + bookId,
            headers: userAuthHeaders()
        });
    }
    return {
        loginUser,
        logoutUser,
        registerUser,
        loadBooks,
        createBook,
        userAuthHeaders,
        findBookById,
        editBook,
        deleteBook,
    };
})();

export default KinveyRequester