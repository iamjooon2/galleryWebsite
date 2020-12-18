// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyA5xZJZA0rRxfi72BTi4QQCUYwBTxJPyf4",
    authDomain: "junheeyeap-a292d.firebaseapp.com",
    projectId: "junheeyeap-a292d",
    storageBucket: "junheeyeap-a292d.appspot.com",
    messagingSenderId: "390334779105",
    appId: "1:390334779105:web:d0bda91a56ecf20f61b1a0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();
let storage = firebase.storage();