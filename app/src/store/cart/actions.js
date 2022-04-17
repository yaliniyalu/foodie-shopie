import {api} from "boot/axios";
import {Checkout} from "capacitor-razorpay";

export async function addItem(context, {item, qty, isUpdate, modifiers}) {
  const res = await api.post('/cart/item', {
    itemId: item.id, qty, modifiers: modifiers, isUpdate
  })
  processCartResponse(context, res)
}

export async function patchItem(context, {id, qty, isUpdate, modifiers}) {
  const res = await api.patch('/cart/item/' + id, {
    qty, modifiers, isUpdate
  })
  processCartResponse(context, res)
}

export async function deleteItem(context, {id}) {
  const res = await api.delete('/cart/item/' + id)
  processCartResponse(context, res)
}

function processCartResponse(context, res) {
  const modify = res.data.data.modify;
  Object.keys(modify).forEach(i => {
    context.commit("updateCartItem", {item: modify[i], id: i})
  })

  res.data.data.delete.forEach(i => {
    context.commit("deleteCartItem", i)
  })
}

export async function moveToSaveLater(context, { id }) {
  await api.patch(`/cart/item/${id}/move`)
  context.commit("deleteCartItem", id)
}

export async function fetchCart(context) {
  if (!context.rootState.app.user) {
    context.commit("setCartItems", [])
    return
  }

  const res = await api.get(`/cart`)
  const items = res.data.data.items
  context.commit("setCartItems", items ?? [])
  context.commit('setDeliveryTimeSlot', res.data.data.timeSlot)
}

export async function removeFromWishList(context, item) {
  await api.delete(`/wishlist?itemId=` + item.id)
  context.commit("removeItemFromWishlist", item)
}

export async function moveWishListToCart(context, item) {
  await api.post('/wishlist/move', {itemId: item.id})
  // context.commit("updateCartItem", { item, qty: 1 })
  context.commit("removeItemFromWishlist", item)
}

export async function fetchWishlist(context) {
  const res = await api.get(`/wishlist`)
  const items = res.data.data.wishlist
  context.commit("setWishlist", items)
}

/*export function startCheckoutProcess(context, items) {
  context.commit("setCheckoutDetails", {type: "items", value: items})
}*/

export function setOrderDetails(context, {type, value}) {
  context.commit("setOrderDetails", {type, value})
}

export function resetOrderDetails(context) {
  context.commit("setOrderDetails", {type: 'deliveryAddress', value: null})
  context.commit("setOrderDetails", {type: 'paymentType', value: null})
  context.commit("setOrderDetails", {type: 'items', value: []})
  context.commit("setOrderDetails", {type: 'couponCode', value: null})
}

export async function tryLoadingDefaultAddress(context) {
  const res = await api.get('/address?limit=3&sortByDesc=updatedAt')
  if (res.data.data.address?.length) {
    context.commit("setOrderDetails", {type: "deliveryAddress", value: res.data.data.address[0]})
    return true
  }
  return false
}

export function finishOrder(context) {
  context.commit("finishOrder")
}

export async function payForOrder(context, request) {
  let payment = null;
  try {
    const data = await Checkout.open(request)
    if (data.response) {
      payment = {...data.response, status: 'success'}
    }
  } catch (error) {
  }

  if (!payment) {
    payment = {razorpay_order_id: request['order_id'], status: 'failure'}
  }

  try {
    await api.patch('order/payment', payment)
  } catch (e) {
  } finally {
  }
  return payment.status
}
