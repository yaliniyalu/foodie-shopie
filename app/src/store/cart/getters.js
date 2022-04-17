import {calculateDiscount, parseItem} from "src/js/utils";

export function getCount(state) {
  return state.items.count
}

export function getItems(state, getter, rootSate, rootGetter) {
  return state.items.map(c => {
    const item = parseItem(c.item, rootSate.app.user)
    return {
      item,
      qty: c.qty,
      totalPrice: c.qty * c.item.price.price,
      discountedAmount: c.item.price.discountedAmount ? c.qty * c.item.price.discountedAmount : 0
    }
  })
}

export function getWishlist(state, getter, rootSate) {
  return state.wishlist.map(c => parseItem(c, rootSate.app.user))
}

export function getTotal(state, getter, rootSate, rootGetter) {
  let subTotal = 0
  let discountedAmount = 0
  let deliveryCharge = 0
  let grandTotal = 0
  let realTotal = 0

  getter.getItems.forEach(v => {
    realTotal += v.totalPrice
    subTotal += v.totalPrice - v.discountedAmount
    discountedAmount += v.discountedAmount
  })

  grandTotal = realTotal + getter['getDeliveryCharge']

  return {
    subTotal, discountedAmount, deliveryCharge, grandTotal
  }
}

export function getDeliveryCharge() {
  return 0
}
