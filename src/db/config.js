import firebase from "firebase/app";

import "firebase/storage";
import "firebase/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyD5YrGi_v5sCbUQiTuPZrP8wY6ComI5WZE",
  authDomain: "simpledb-fc1f7.firebaseapp.com",
  databaseURL: "https://simpledb-fc1f7.firebaseio.com",
  projectId: "simpledb-fc1f7",
  storageBucket: "simpledb-fc1f7.appspot.com",
  messagingSenderId: "398743346204",
  appId: "1:398743346204:web:e40daf0e50e17b72d613d9"
};

const initFire = firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();

export { db, storage, firebase as default };
