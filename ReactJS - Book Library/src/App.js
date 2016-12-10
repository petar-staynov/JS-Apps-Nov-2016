import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import $ from 'jquery';
import NavigationBar from './Components/NavigationBar';
// import Header from './Components/Header';
import Footer from './Components/Footer';
import HomeView from './Views/HomeView';
import LoginView from './Views/LoginView';
import RegisterView from './Views/RegisterView';
import BooksView from './Views/ListBooksView';
import CreateBookView from './Views/CreateBookView';
import EditBookView from './Views/EditBookView';
import DeleteBookView from './Views/DeleteBookView';
import KinveyRequester from './KinveyRequester';


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: sessionStorage.getItem("username"),
            userId: sessionStorage.getItem("userId")
        };
    }

    componentDidMount() {
        // Attach global AJAX "loading" event handlers
        $(document).on({
            ajaxStart: function() { $("#loadingBox").show() },
            ajaxStop: function() { $("#loadingBox").hide() }
        });

        // Attach a global AJAX error handler
        $(document).ajaxError(this.handleAjaxError.bind(this));

        // Hide the info / error boxes when clicked
        $("#infoBox, #errorBox").click(function() {
            $(this).fadeOut();
        });

        // Initially load the "Home" view when the app starts
        this.showHomeView();

        $('#errorBox, #infoBox, #loadingBox').click(function () { $(this).hide })
    }

    handleAjaxError(event, response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON &&
            response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        this.showError(errorMsg);
    }
    showInfo(message) {
        $('#infoBox').text(message).show();
        setTimeout(function() {
            $('#infoBox').fadeOut();
        }, 3000);
    }

    showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg).show();
    }



    render() {
    return (
      <div className="App">
          <header>
              <NavigationBar
                  username={this.state.username}
                  homeClicked={this.showHomeView.bind(this)}
                  loginClicked={this.showLoginView.bind(this)}
                  registerClicked={this.showRegisterView.bind(this)}
                  booksClicked={this.showBooksView.bind(this)}
                  createBookClicked={this.showCreateBookView.bind(this)}
                  logoutClicked={this.logout.bind(this)}
              />
              <div id="errorBox">Error box</div>
              <div id="infoBox">Info Box</div>
              <div id="loadingBox">Loading Box</div>
          </header>
          <div id="main">
              Main Content
          </div>
          <footer>
              <Footer/>
          </footer>
      </div>
    );
  }

  showView(reactComponent) {
        ReactDOM.render(
            reactComponent,
            document.getElementById('main'));
        $('#errorBox').hide();
  }

   showHomeView() {
    this.showView(<HomeView/>)
   }

   showLoginView() {
    this.showView(<LoginView onsubmit={this.login.bind(this)}/>);
   }

   login(username, password){
       KinveyRequester.loginUser(username, password)
           .then(loginSuccess.bind(this));

       function loginSuccess(kinveyResponse) {
            this.saveAuthInSession(kinveyResponse);
            this.showInfo('Login successful');
            this.showBooksView();

       }
   }
   saveAuthInSession(kinveyResponse){
       sessionStorage.setItem('authToken', kinveyResponse._kmd.authtoken);
       sessionStorage.setItem('userId', kinveyResponse._id);
       sessionStorage.setItem('username', kinveyResponse.username);

       this.setState({
           username: kinveyResponse.username,
           userId: kinveyResponse._id
       })
   }
   showRegisterView() {
       this.showView(<RegisterView onsubmit={this.register.bind(this)}/>);
   }

   register(username, password){
        KinveyRequester.registerUser(username, password)
            .then(registerSuccess.bind(this));

        function registerSuccess(kinveyResponse) {
            this.saveAuthInSession(kinveyResponse);
            this.showInfo('Register successful');
            this.showBooksView();

        }
    }
    showBooksView() {
       KinveyRequester.loadBooks()
           .then(loadBooksSuccess.bind(this));

       function loadBooksSuccess(books) {
           this.showInfo('Books loaded');
           this.showView(<BooksView
               books={books}
               userId={this.state.userId}
               editBookClicked={this.prepareBookForEdit.bind(this)}
               deleteBookClicked={this.confirmBookDelete.bind(this)}/>);
       }
    }
    prepareBookForEdit(bookId) {
        KinveyRequester.findBookById(bookId)
            .then(loadBookForEditSuccess.bind(this));

        function loadBookForEditSuccess(bookInfo) {
            this.showView(
                <EditBookView
                    onsubmit={this.editBook.bind(this)}
                    bookId={bookInfo._id}
                    title={bookInfo.title}
                    author={bookInfo.author}
                    description={bookInfo.description}
                />
            );
        }
    }
    editBook(bookId, title, author, description) {
        KinveyRequester.editBook(bookId, title, author, description)
            .then(editBookSuccess.bind(this));

        function editBookSuccess() {
            this.showBooksView();
            this.showInfo("Book created.");
        }
    }

    confirmBookDelete(bookId) {
        KinveyRequester.findBookById(bookId)
            .then(loadBookForDeleteSuccess.bind(this));

        function loadBookForDeleteSuccess(bookInfo) {
            this.showView(
                <DeleteBookView
                    onsubmit={this.deleteBook.bind(this)}
                    bookId={bookInfo._id}
                    title={bookInfo.title}
                    author={bookInfo.author}
                    description={bookInfo.description}
                />
            );
        }
    }
    deleteBook(bookId) {
        KinveyRequester.deleteBook(bookId)
            .then(deleteBookSuccess.bind(this));

        function deleteBookSuccess() {
            this.showBooksView();
            this.showInfo("Book deleted.");
        }
    }


    showCreateBookView() {
        this.showView(<CreateBookView onsubmit={this.createBook.bind(this)} />);
    }

    createBook(title, author, description) {
        KinveyRequester.createBook(title, author, description)
            .then(createBookSuccess.bind(this));

        function createBookSuccess() {
            this.showBooksView();
            this.showInfo("Book created.");
        }
    }
    logout() {
       sessionStorage.clear();
        this.setState({
          username: null,
          userId: null
      });
       this.showHomeView();
   }
}
