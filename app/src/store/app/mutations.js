/*
export function someMutation (state) {
}
*/

export function setUser(state, user) {
  state.user = user
}

export function setDashboard(state, dashboard) {
  state.dashboard = dashboard
}

export function setFcmToken(state, token) {
  state.fcmToken = token
}

export function setCategories(state, category) {
  state.categories = category
}

export function setSettings(state, settings) {
  state.settings = settings
}

export function setItemsLayout(state, layout) {
  state.itemsLayout = layout
}

export function setCompany(state, company) {
  state.company = company
}

export function setIsSideMenuOpened(state, isOpened) {
  state.isSideMenuOpened = isOpened
}

export function setAccountInfo(state, info) {
  state.user = {...state.user, ...info}
}

export function setCurrentLocation(state, pincode) {
  state.currentLocation = pincode
}

export function setNavbar(state, options) {
  state.navbar = options
}
