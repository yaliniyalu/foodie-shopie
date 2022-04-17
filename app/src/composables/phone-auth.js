import {onBeforeUnmount, onMounted, ref} from "vue";
const { SMSReceive } = window
import { FirebaseX } from '@awesome-cordova-plugins/firebase-x';
import {isInt} from "src/js/utils";
import {useStore} from "vuex";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {Platform} from "quasar";

function useFirebasePhoneAuthWeb({ mobile, otp, isMobileVerified, sendingOtp, verifying, infoText, isError, afterLogin }) {

  let recaptchaVerifier = null

  let confirmationResult = null
  const store = useStore()

  async function signIn(user) {
    await store.dispatch("app/loginWithFirebaseToken", {idToken: user.accessToken})
    afterLogin.value()
  }

  async function sendOtp() {
    if (!mobile.value) {
      return;
    }

    sendingOtp.value = true
    try {
      const auth = getAuth();
      recaptchaVerifier = new RecaptchaVerifier('sign-in-button', {
        'size': 'invisible',
        'callback': (response) => {
        },
        'expired-callback': () => {
        }
      }, auth);
      confirmationResult = await signInWithPhoneNumber(auth, '+91' + mobile.value, recaptchaVerifier)

      infoText.value = "The otp has been sent to registered mobile no."
      isMobileVerified.value = true
    } catch (e) {
      infoText.value = e.message ?? e
      isError.value = true
    } finally {
      sendingOtp.value = false
    }
  }

  async function verify() {
    if (!confirmationResult) {
      isMobileVerified.value = false
      return
    }

    if (!otp.value) {
      return;
    }

    verifying.value = true
    try {
      const result = await confirmationResult.confirm(otp.value)
      await signIn(result.user)
    } catch (e) {
      infoText.value = e.message ?? e
      isError.value = true
    } finally {
      verifying.value = false
    }
  }

  return {
    sendOtp, verify
  }
}

function useFirebasePhoneAuthCapacitor({ mobile, otp, isMobileVerified, sendingOtp, verifying, infoText, isError, afterLogin }) {
  let credential = null
  const store = useStore()

  async function signInWithCredential() {
    await FirebaseX.signInWithCredential(credential)
    const user = await FirebaseX.getCurrentUser()
    await store.dispatch("app/loginWithFirebaseToken", user)
    afterLogin.value()
  }

  async function sendOtp() {
    if (!mobile.value) {
      return;
    }

    infoText.value = null
    isError.value = false

    const number = '+91' + mobile.value;
    const timeOutDuration = 30;

    try {
      sendingOtp.value = true
      infoText.value = "Automatically reading otp..."
      credential = await FirebaseX.verifyPhoneNumber(number, timeOutDuration)

      if (credential.instantVerification) {
        await signInWithCredential()
      } else {
        infoText.value = "The otp has been sent to registered mobile no."
        isMobileVerified.value = true
      }
    } catch (e) {
      console.error(e)
      infoText.value = e.message ?? e
      isError.value = true
    } finally {
      sendingOtp.value = false
    }
  }

  async function verify() {
    if (!credential) {
      isMobileVerified.value = false
      return
    }

    if (!otp.value) {
      return;
    }

    infoText.value = null
    isError.value = false

    credential.code = otp.value
    try {
      verifying.value = true
      await signInWithCredential()
    } catch (e) {
      infoText.value = e.message ?? e
      isError.value = true
    } finally {
      verifying.value = false
    }
  }

  return {
    sendOtp, verify
  }
}

function useSmsPhoneAuth({ mobile, otp, isMobileVerified, sendingOtp, verifying, infoText, isError, afterLogin }) {
  const store = useStore()
  let otpHash = null

  async function sendOtp() {
    if (!mobile.value) {
      return;
    }

    infoText.value = null
    isError.value = false

    try {
      sendingOtp.value = true
      const data = await store.dispatch("app/verifyMobile", mobile.value)
      otpHash = data['otp_hash']
      isMobileVerified.value = true
      infoText.value = "The otp has been sent to registered mobile no."
    } catch (e) {
      infoText.value = e.message ?? e
      isError.value = true
    } finally {
      sendingOtp.value = false
    }
  }

  async function verify() {
    if (!otp.value) {
      return;
    }

    infoText.value = null
    isError.value = false

    try {
      verifying.value = true
      await store.dispatch("app/verifyOtp", {mobile: mobile.value, otp: otp.value})

      afterLogin.value()
    } catch (e) {
      infoText.value = e.message ?? e
      isError.value = true
    } finally {
      verifying.value = false
    }
  }

  function receiveSMS(e) {
    if (!otpHash) {
      return
    }

    const message = e.data.body

    const hash = message.slice(-6)
    if (!hash || hash !== otpHash) {
      return;
    }

    const code = message.slice(0, 6);
    if (code.length === 6 && isInt(code)) {
      otp.value = code
      verify().then()
    }
  }

  if (Platform.is.capacitor && Platform.is.android) {
      onMounted(() => {
        SMSReceive.startWatch()
        document.addEventListener('onSMSArrive', receiveSMS)
      })

      onBeforeUnmount(() => {
        document.removeEventListener('onSMSArrive', receiveSMS)
        SMSReceive.stopWatch()
      })
  }

  return {
    sendOtp, verify
  }
}

export function usePhoneAuth(driver) {
  const mobile = ref('')
  const otp = ref('')

  const sendingOtp = ref(false)
  const verifying = ref(false)

  const infoText = ref()
  const isError = ref(false)

  const isMobileVerified = ref(false)

  const afterLogin = ref(() => '')

  const onLoggedIn = (fn) => afterLogin.value = fn

  const obj = {
    mobile, otp, sendingOtp, verifying, infoText, isError, isMobileVerified, afterLogin
  }

  let driverObj = null
  if (driver === 'firebase-capacitor') {
    driverObj = useFirebasePhoneAuthCapacitor(obj)
  } else if (driver === 'firebase-web') {
    driverObj = useFirebasePhoneAuthWeb(obj)
  } else if (driver === 'sms') {
    driverObj = useSmsPhoneAuth(obj)
  }

  return {
    mobile,
    otp,
    sendingOtp,
    verifying,
    infoText,
    isError,
    isMobileVerified,
    onLoggedIn,
    ...driverObj
  }
}
