import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  //   apiKey: "YOUR_FIREBASE_API_KEY",
  //   authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  //   projectId: "YOUR_FIREBASE_PROJECT_ID",
  //   storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  //   messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  //   appId: "YOUR_FIREBASE_APP_ID",
  apiKey: "AIzaSyA3YNiqYeaeu9flJI4kHzx4K7P6HwZV6Yg",
  authDomain: "doc-upload-facac.firebaseapp.com",
  projectId: "doc-upload-facac",
  storageBucket: "doc-upload-facac.firebasestorage.app",
  messagingSenderId: "1052188284971",
  appId: "1:1052188284971:web:ef8f78ca7483fd8132f26e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
