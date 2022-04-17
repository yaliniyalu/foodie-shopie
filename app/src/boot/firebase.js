import { boot } from 'quasar/wrappers'
import { initializeApp } from "firebase/app";
import {Platform} from "quasar";
import {FirebaseX} from "@awesome-cordova-plugins/firebase-x";

export default boot(async ( { store, router } ) => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);

  if (Platform.is.capacitor) {
    FirebaseX.onMessageReceived().subscribe(data => {
      if (data['tap'] && data['order_id']) {
        router.push('/order/' + data['order_id'])
      }
    })
  }
})
