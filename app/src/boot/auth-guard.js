import { boot } from 'quasar/wrappers'
import NotAuthenticatedException from "src/js/exceptions";

export default boot(async ( { router, store } ) => {
  router.beforeEach(async (to, from, next) => {
    if (to.meta['auth'] === true) {
      try {
        await store.dispatch("app/setSideMenuOpened", false)
        await store.dispatch("app/doAuthenticated")
        next()
      } catch (e) {
        next(false)
      }
      return
    }
    next()
  })
})
