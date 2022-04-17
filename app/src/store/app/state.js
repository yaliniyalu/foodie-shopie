export default function () {
  return {
    user: null,
    fcmToken: null,
    app: {
      name: 'Foodie Shopie',
      logo: require('src/assets/logo-hz.png')
    },
    navbar: {
      title: null,
      options: ''
    },
    settings: null,
    dashboard: null,
    categories: [],
    itemsLayout: 'grid',
    isSideMenuOpened: false,
    currentLocation: null
  }
}
