import {Dialog, LocalStorage, Platform} from "quasar";
import {api} from "boot/axios";
import LoginDialog from "components/dialogs/LoginDialog";
import AdditionalPageDialog from "components/dialogs/AdditionalPageDialog";
import LocationService from "src/service/location-service";
import {FirebaseX} from "@awesome-cordova-plugins/firebase-x";
import {PushNotifications} from "@capacitor/push-notifications";
import {FCM} from "@capacitor-community/fcm";

export async function verifyMobile(context, phone) {
  try {
    const res = await api.post('auth/register', {phone})
    return res.data.data
  } catch (e) {
    throw new Error(e.response?.data.error?.common ?? e.message)
  }
}

async function processLoginResponse(context, res) {
  const u = res.data.user
  const user = {
    id: u['id'],
    name: u['name'],
    isPrime: u['customerType'] === 'Prime',
    phone: u['phone']
  }

  await setToken(res.data.token)
  context.commit("setUser", user)
}

export async function verifyOtp(context, {mobile, otp}) {
  const res = await api.post('auth/login', {phone: mobile, password: otp})
  await processLoginResponse(context, res)
}

export async function loginWithFirebaseToken(context, user) {
  const res = await api.post('auth/login/firebase', user)
  await processLoginResponse(context, res)
}

export async function setToken(token) {
  token['expiresIn'] *= 30;
  LocalStorage.set("token", {
    token: token['token'],
    expiresAt: Math.round(Date.now() / 1000) + (token['expiresIn'] - (24 * 60 * 60)), // expiry - 1 day
    createdAt: Math.round(Date.now() / 1000)
  })
  api.defaults.headers.Authorization = "Bearer " + token['token']
}

export async function loadToken(context) {
  /** @type Object<{token: string, expiresAt: number}> */
  const token = LocalStorage.getItem('token')
  if (!token) return

  if (token.expiresAt <= Math.round(Date.now() / 1000)) { // expired
    LocalStorage.remove('token')
    return
  }

  api.defaults.headers.Authorization = "Bearer " + token.token

  if ((token.createdAt + (24 * 60 * 60)) <= Math.round(Date.now() / 1000)) { // not refreshed within one day
    const res = await api.post("/auth/refresh")
    await setToken(res.data)
  }

  const res = await api.get("/auth/me")
  const data = res.data.data
  const user = {
    id: data['id'],
    name: data['name'],
    isPrime: data['customerType'] === 'Prime',
    phone: data['phone'],
    email: data['email']
  }
  await context.commit("setUser", user)
  context.dispatch("updateFcm").catch()
}

export async function logout(context, remote = true) {
  if (remote) {
    await api.post('auth/logout').catch()
  }

  LocalStorage.remove("token")
}

export async function loadDashboard(context) {
  const res = await api.get('home?listLimit=15&customerType=' + (context.state.user?.isPrime ? 'Prime' : 'Normal'))
  const data = res.data;

  context.commit("setDashboard", data)
}

export async function fetchCategory(context) {
  try {
    const res = await api.get("category?select=id,name,image,banner_image&filter[is_active]=1")
    context.commit("setCategories", res.data.data.categories)
  } catch (e) {
    throw new Error(e.response?.data().message ?? e.message)
  }
}

export async function setItemsLayout(context, layout) {
  LocalStorage.set("settings.itemsLayout", layout)
  context.commit("setItemsLayout", layout)
}

export async function loadSettings(context) {
  const itemsLayout = LocalStorage.getItem('settings.itemsLayout') ?? 'grid'
  context.commit("setItemsLayout", itemsLayout)

  const pincode = LocalStorage.getItem("settings.currentLocation")
  if (pincode) {
    await context.dispatch("setCurrentLocation", {pincode, isTemp: true})
  } else {
    const location = await getCurrentLocationSilent(context)
    await context.dispatch("setCurrentLocation", {pincode: location.address.pincode, isTemp: true})
  }
}

export async function postContactEnquiry(context, contact) {
  await api.post('contact', contact)
}

export async function doAuthenticated(context) {
  if (context.state.user) {
    return Promise.resolve()
  } else {
    return new Promise(((resolve, reject) => {
      Dialog
        .create({component: LoginDialog})
        .onOk(() => resolve())
        .onCancel(() => reject())
        .onDismiss(() => reject())
    }))
  }
}

export function setSideMenuOpened(context, isOpened) {
  context.commit("setIsSideMenuOpened", isOpened)
}

export async function updateFcm(context) {
  if (!Platform.is.capacitor) {
    return
  }

  if (!context.state.user) {
    return
  }

  try {
    if (context.state.fcmToken) {
      await updateFCM(context, context.state.fcmToken)
      return
    }

    FirebaseX.grantPermission()
      .then(async (hasPermission) => {
        if (hasPermission) {
          const token = await FirebaseX.getToken()
          context.commit('setFcmToken', token)
          await updateFCM(context, token)
        }
      }).catch(e => console.error(e))
  } catch (e) {
    console.error(JSON.stringify(e))
  }
}

export async function updateAccountInfo(context, info) {
  try {
    await api.patch("auth/me", info)
    context.commit("setAccountInfo", info)
  } catch (e) {
    throw new Error(e.response?.data.message ?? e.message)
  }
}

export async function updateFCM(context, fcm_id) {
  try {
    await api.patch("auth/me/fcm", {fcm_id})
    context.commit("setAccountInfo", {fcm_id})
  } catch (e) {
    throw new Error(e.response?.data.message ?? e.message)
  }
}

export async function openPage(context, {page}) {
  Dialog.create({
    component: AdditionalPageDialog,
    componentProps: {
      page
    }
  })
}

export async function getCurrentLocation() {
  const {coords: {latitude, longitude}} = await LocationService.getLocation();

  const res = await api.get(`geocode/location?lat=${latitude}&lng=${longitude}`)
  return res.data.data
}

export async function getCurrentLocationSilent() {
  const {coords: {latitude, longitude}} = await LocationService.getLocationSilent(true);

  const res = await api.get(`geocode/location?lat=${latitude}&lng=${longitude}`)
  return res.data.data
}

export async function setCurrentLocation(context, {pincode, isTemp}) {
  const res = await api.get('cart/location?pincode=' + pincode)

  if (!isTemp) {
    LocalStorage.set("settings.currentLocation", pincode)
  }

  context.commit("cart/setDeliveryLocation", res.data.data, {root: true})
  context.commit('setCurrentLocation', pincode)
}

export async function loadCategory(context) {
  const res = await api.get('category/all')
  context.commit("setCategories", res.data.data)
}

export async function loadAppSettings(context) {
  const res = await api.get('settings')
  context.commit('setSettings', res.data.data)
}

export function setNavbar(context, options) {
  context.commit('setNavbar', options)
}
