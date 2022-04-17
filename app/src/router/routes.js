
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index') },
      { path: 'home', component: () => import('pages/Index') },
      { path: 'category/:id?', component: () => import('pages/Category') },
      { path: 'items', component: () => import('pages/Items') },
      { path: 'item/:id', component: () => import('pages/Item') },

      { path: 'cart', component: () => import('pages/Cart'), meta: { auth: true } },
      { path: 'wishlist', component: () => import('pages/WishList'), meta: { auth: true } },
      { path: 'orders', component: () => import('pages/Orders'), meta: { auth: true } },
      { path: 'order/:id', component: () => import('pages/Order'), meta: { auth: true }  },
      { path: 'account', component: () => import('pages/Account'), meta: { auth: true }  },

      { path: 'contact', component: () => import('pages/ContactUs') },
      { path: 'about', component: () => import('pages/About') },

      { path: 'checkout/address', component: () => import('pages/checkout/Address'), name: "Checkout.Address", meta: { auth: true }   },
      { path: 'checkout/payment/type', component: () => import('pages/checkout/PaymentType'), name: "Checkout.PaymentType", meta: { auth: true }   },
      { path: 'checkout/summary', component: () => import('pages/checkout/OrderSummary'), name: "Checkout.Summary", meta: { auth: true }   },
      { path: 'checkout/status', component: () => import('pages/checkout/OrderStatus'), name: "Checkout.Status", meta: { auth: true }   },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
