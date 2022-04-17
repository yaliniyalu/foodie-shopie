import {LocalStorage} from "quasar";
import {api} from "boot/axios";
import { getMessaging, getToken } from "firebase/messaging";

export async function setToken(token) {
  token['expiresIn'] *= 30;
  LocalStorage.set("token", {
    token: token['token'],
    expiresAt: Math.round(Date.now() / 1000) + (token['expiresIn'] - (24 * 60 * 60)), // expiry - 1 day
    createdAt: Math.round(Date.now() / 1000)
  })
  api.defaults.headers.Authorization = "Bearer " + token['token']
}

export async function loadUser(context) {
  const res = await api.get("/auth/me")
  const data = res.data.data
  const user = {
    id: data['id'],
    name: data['name'],
    phone: data['phone'],
    email: data['email'],
    image: data['image']
  }
  await context.commit("setUser", user)
}

export async function authenticate(context, token) {
  await setToken(token)
  await loadUser(context)
  context.commit('setAuthenticated', true)
}

export async function loadToken(context) {
  /** @type Object<{token: string, expiresAt: number}> */
  const token = LocalStorage.getItem('token')
  if (!token) return false

  if (token.expiresAt <= Math.round(Date.now() / 1000)) { // expired
    LocalStorage.remove('token')
    return false
  }

  api.defaults.headers.Authorization = "Bearer " + token.token

  if ((token.createdAt + (24 * 60 * 60)) <= Math.round(Date.now() / 1000)) { // not refreshed within one day
    // const res = await api.post("/auth/refresh")
    // await setToken(res.data)
  }

  await loadUser(context)

  context.commit('setAuthenticated', true)
  return true
}

export async function logout(context, withRequest = true) {
  if (withRequest) {
      await api.post("auth/logout").catch()
  }
  LocalStorage.remove("token")
  context.commit('setAuthenticated', false)
}

export async function generateFcm() {
  return new Promise(((resolve, reject) => {
    const messaging = getMessaging();

    getToken(messaging, { vapidKey: process.env.FCM_VAPID_KEY })
      .then((currentToken) => {
        if (currentToken) {
          api.patch('/auth/me/fcm', {fcm_id: currentToken})
            .then(() => resolve())
            .catch(() => reject('API_ERROR'))
        } else {
          reject("NO_PERMISSION")
        }
      }).catch((err) => {
      console.log(err)
      reject('TOKEN_ERROR')
    });
  }))
}

