import { boot } from 'quasar/wrappers'
import {computed} from "vue";

export default boot(async ( { router, store } ) => {

  const isAuthenticated = computed(() => store.state.app.isAuthenticated)

  router.beforeEach(async (to, from, next) => {
    if (to.meta['auth'] === false) {
      return next()
    }

    if (isAuthenticated.value) {
      return next()
    }

    const isAuth = await store.dispatch('app/loadToken', {loader: true})

    if(isAuth) {
      next();
    } else {
      next('/login?next=' + to.fullPath);
    }
  })
})
