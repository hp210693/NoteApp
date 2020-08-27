// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require('firebase/app');
// Add the Firebase products that you want to use
require('firebase/auth');
require('firebase/firestore');
const firebaseConfig = {
  apiKey: 'AIzaSyCVRvLSgSM_eQVmPuR_SGaXvc7h7fk1lzg',
  authDomain: 'noteapp-d2d9d.firebaseapp.com',
  databaseURL: 'https://noteapp-d2d9d.firebaseio.com',
  projectId: 'noteapp-d2d9d',
  storageBucket: 'noteapp-d2d9d.appspot.com',
  messagingSenderId: '168573751810',
  appId: '1:168573751810:web:a88b53a00a7639df604d1b',
  measurementId: 'G-GS6C8HYPSZ',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

///////////////////////////////////////////////////

var sha1 = require('js-sha1');
var rsa = require('./rsa');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
// Listenning port 3000
server.listen(3000);

const listNote = [
  {
    id: '1',
    title: 'c++',
  },
  {
    id: '2',
    title: 'java',
  },
  {
    id: '3',
    title: 'c',
  },
  {
    id: '4',
    title: 'c#',
  },
  {
    id: '5',
    title: 'javascript',
  },
];

io.on('connection', function (socket) {
  console.log('New client conection to server with id = ' + socket.id);

  var [publicKey, privateKey] = rsa.generateRSAKeys();
  console.log('Server prepare sent publickey = ' + publicKey);

  // The server sents a publicKey to mobile app
  io.sockets.emit('server-sent-pubickey', publicKey);

  // The server is listening login event from the mobile
  socket.on('client-sent-login', function (
    cipherTextEmail,
    cipherTextPassword
  ) {
    // email and password decrypted
    var emailEncrypted = rsa.decryptRSA(cipherTextEmail, privateKey);
    var passwordEncrypted = rsa.decryptRSA(cipherTextPassword, privateKey);

    // Hashing password
    let hashpassword = sha1(passwordEncrypted);

    firebase
      .auth()
      // Sign in email and password on firebase
      .signInWithEmailAndPassword(emailEncrypted, hashpassword)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
          console.log('Wrong password');
        } else {
          console.log('The server error: \n' + errorMessage);
        }
        console.log('Unknown--' + error);

        // [END_EXCLUDE]
      });

    ///////////////////////////////
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log('Login ok user = ' + user);
        io.sockets.emit('server-sent-verify-email', 'auth/ok');
        // console.log('\n\n sever dang gui list \n\n' + listNote);
        // The server sent list note
        io.sockets.emit('server-sent-listnote', listNote);
      } else {
        console.log('++logout = ' + user);
        io.sockets.emit('server-sent-verify-email', 'auth/logout');
        io.sockets.emit('server-sent-listnote', listNote);
      }
    });
  });
});
