import firebase from 'firebase'
require('@firebase/firestore')

  var firebaseConfig = {
    apiKey: "AIzaSyBpdLvXtm9LsbvwRiwpnXo5Sp6mhhjMCR0",
    authDomain: "atlas-8b042.firebaseapp.com",
    databaseURL: "https://atlas-8b042.firebaseapp.com",
    projectId: "atlas-8b042",
    storageBucket: "atlas-8b042.appspot.com",
    messagingSenderId: "1033816391176",
    appId: "1:1033816391176:web:b76c0c7af7784c61f71bbd"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()