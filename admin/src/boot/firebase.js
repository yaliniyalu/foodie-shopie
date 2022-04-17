import { boot } from 'quasar/wrappers'
import { initializeApp } from "firebase/app";

export default boot(async (/* { app, router, ... } */) => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
})
