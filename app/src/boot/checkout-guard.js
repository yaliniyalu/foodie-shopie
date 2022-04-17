import { boot } from 'quasar/wrappers'

export default boot(async ( { router, store } ) => {
  router.beforeEach(async (to, from, next) => {
    if (to.name?.startsWith("Checkout")) {
      const order = store.state.cart.order
      let guard = false
      switch (to.name) {
        case "Checkout.Address":
          if (!order.items.length) guard = true
          break;

        case "Checkout.PaymentType":
          if (!order.items.length) guard = true
          else if (!order.deliveryAddress) guard = true
          break;

        case "Checkout.Summary":
          if (!order.items.length) guard = true
          else if (!order.deliveryAddress) guard = true
          break;
      }

      if (guard) next('/')
      else next()
      return
    }
    next()
  })
})
