import { boot } from 'quasar/wrappers'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ( { store } ) => {
  await store.dispatch("app/loadToken")
  store.dispatch("app/loadSettings")
  store.dispatch("cart/fetchCart")
})
