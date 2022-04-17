
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'analytics', component: () => import('pages/analytics/Analytics') },
      { path: 'settings/home/builder', component: () => import('pages/settings/home-page-builder/HomePageBuilder') },
      { path: 'settings/other', component: () => import('pages/settings/other-settings/OtherSettings') },
      { path: 'account/me', component: () => import('pages/settings/my-account/MyAccount') },
      { path: 'item/:id/edit', component: () => import('pages/item/ItemEdit'), props: route => ({ id: route.params.id }) },
      { path: 'item/new', component: () => import('pages/item/ItemEdit'), props: _ => ({ id: null }) },
      {
        path: 'item',
        component: () => import('pages/item/Items'),
        children: [
          { path: ':id', component: () => import('pages/item/ItemPreview'), props: route => ({ id: route.params.id }) },
        ]
      },
      {
        path: 'order',
        component: () => import('pages/order/Orders'),
        children: [
          { path: ':id', component: () => import('pages/order/OrderPreview'), props: route => ({ id: route.params.id }) },
        ]
      },
      {
        path: 'today-deals',
        component: () => import('pages/today-deals/TodayDeals'),
        children: [
          { path: ':id', component: () => import('pages/item/ItemPreview'), props: route => ({ id: route.params.id }) },
        ]
      },
      {
        path: 'category',
        component: () => import('pages/category/Category'),
        children: [
          { path: 'new', component: () => import('pages/category/CategoryEdit'), props: _ => ({ id: null }) },
          { path: ':id', component: () => import('pages/category/CategoryPreview'), props: route => ({ id: route.params.id }) },
          { path: ':id/edit', component: () => import('pages/category/CategoryEdit'), props: route => ({ id: route.params.id }) }
        ]
      },
      {
        path: 'coupon',
        component: () => import('pages/coupon/Coupons'),
        children: [
          { path: 'new', component: () => import('pages/coupon/CouponEdit'), props: _ => ({ id: null }) },
          { path: ':id', component: () => import('pages/coupon/CouponPreview'), props: route => ({ id: route.params.id }) },
          { path: ':id/edit', component: () => import('pages/coupon/CouponEdit'), props: route => ({ id: route.params.id }) }
        ]
      },
      {
        path: 'account',
        component: () => import('pages/account/Accounts'),
        children: [
          { path: 'new', component: () => import('pages/account/AccountEdit'), props: _ => ({ id: null }) },
          { path: ':id', component: () => import('pages/account/AccountPreview'), props: route => ({ id: route.params.id }) },
          { path: ':id/edit', component: () => import('pages/account/AccountEdit'), props: route => ({ id: route.params.id }) }
        ]
      },
      {
        path: 'customer',
        component: () => import('pages/customer/Customers'),
        children: [
          { path: ':id', component: () => import('pages/customer/CustomerPreview'), props: route => ({ id: route.params.id }) }
        ]
      },
      {
        path: 'review',
        component: () => import('pages/review/Reviews'),
        children: [
          { path: ':id', component: () => import('pages/review/ReviewPreview'), props: route => ({ id: route.params.id }) }
        ]
      },
      {
        path: 'message',
        component: () => import('pages/message/Messages'),
        children: [
          { path: ':id', component: () => import('pages/message/MessagePreview'), props: route => ({ id: route.params.id }) }
        ]
      },
      {
        path: 'settings/location',
        component: () => import('pages/settings/location/Locations'),
        children: [
          { path: 'new', component: () => import('pages/settings/location/LocationEdit'), props: _ => ({ id: null }) },
          { path: ':id', component: () => import('pages/settings/location/LocationPreview'), props: route => ({ id: route.params.id }) },
          { path: ':id/edit', component: () => import('pages/settings/location/LocationEdit'), props: route => ({ id: route.params.id }) }
        ]
      },
      { path: 'settings/other', component: () => import('pages/settings/other-settings/OtherSettings') },
    ]
  },

  {
    path: '/settings/home/preview',
    component: () => import('layouts/FullPageLayout'),
    children: [
      { path: '', component: () => import('pages/settings/home-page-builder/HomePagePreview') }
    ]
  },

  {
    path: '/login',
    component: () => import('layouts/FullPageLayout'),
    children: [
      { path: '', component: () => import('pages/Login'), meta: {auth: false} }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
    meta: {auth: false}
  }
]

export default routes
