import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { getDatabase, ref as firebaseDatabaseRef, set as firebaseDatabaseSet, child, get, onValue } from 'firebase/database'
//ref tham chieu den collection
import { doc, setDoc } from 'firebase/firestore';





const firebaseConfig = {
    apiKey: "AIzaSyC2begOWUg5HG_QLBksGDeZQDDNpoOxKHg",
    authDomain: "chat-app-2055e.firebaseapp.com",
    databaseURL: "https://chat-app-2055e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "chat-app-2055e",
    storageBucket: "chat-app-2055e.appspot.com",
    appId: "1:916296857357:android:97ae2be8492bbade496244",
    messagingSenderId: "916296857357",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth()
const firebaseDatabase = getDatabase()

export {
    auth,
    setPersistence,
    firebaseDatabase,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    firebaseDatabaseRef,
    firebaseDatabaseSet,
    sendEmailVerification,
    child,
    get,
    onValue,                    // Để theo dõi thay đổi
    doc,
    setDoc,
}