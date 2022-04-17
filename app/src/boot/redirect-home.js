import { boot } from 'quasar/wrappers'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ( { router } ) => {
  router.beforeEach((to, from, next) => {
    if (to.path === '/') {
      next('/home')
    } else {
      next()
    }
  })
})
