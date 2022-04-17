export function updateCartItem(state, { item, id }) {
  const index = state.items.findIndex(v => v.id === id)

  if (index >= 0) {
    state.items[index] = item
  } else {
    state.items.push(item)
  }
}

export function deleteCartItem(state, id) {
  const index = state.items.findIndex(v => v.id === id)
  state.items.splice(index, 1);
}

export function setCartItems(state, items) {
  state.items = items
}

export function setDeliveryTimeSlot(state, slot) {
  state.timeSlot = slot
}

export function setDeliveryLocation(state, location) {
  state.deliveryLocation = location
}

export function setWishlist(state, items) {
  state.wishlist = items
}

export function removeItemFromWishlist(state, item) {
  const index = state.wishlist.findIndex(v => v.id === item.id)
  if (index !== -1) {
    state.wishlist.splice(index, 1);
  }
}

export function setOrderDetails(state, { type, value }) {
  state.order[type] = value
}

export function finishOrder(state) {
  state.order = {
    deliveryAddress: null,
    deliveryType: "Home Delivery",
    deliveryCharge: 0,
    paymentType: null,
    items: [],
  }
}
