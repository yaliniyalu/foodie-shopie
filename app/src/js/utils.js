import {date, extend} from 'quasar'

export function formatCurrency(price) {
  if (!price) {
    return "₹0"
  }

  if (isInt(price)) {
    return "₹" + parseFloat(price).toFixed(0)
  }

  return "₹" + parseFloat(price).toFixed(2)
}

export function formatQty(qty) {
  if (!qty) {
    return "0"
  }

  if (isInt(qty)) {
    return parseFloat(qty).toFixed(0)
  }

  return parseFloat(qty).toFixed(2)
}

export function formatFraction(qty) {
  if (!qty) {
    return "0"
  }

  qty += ""
  const q = qty.split('.')

  if (q[0] === '0') {
    q[0] = ''
  }

  switch (q[1]) {
    default:
      return qty

    case '5':
    case '50':
      return q[0] + '½'

    case '25':
      return q[0] + '¼'

    case '75':
      return q[0] + '¾'
  }
}

export function formatDate(d) {
  return date.formatDate(d, 'DD-MM-YYYY hh:mm a')
}

export function formatTime(d) {
  return date.formatDate(d, 'hh:mm a')
}

export function formatDateType(d) {
  if (isToday(new Date(d))) {
    return 'Today'
  }

  if (isTomorrow(new Date(d))) {
    return 'Tomorrow'
  }

  return date.formatDate(d, 'MMM, DD')
}

export function formatSlotTime(time) {
  time = time.split(':')

  if (time[0] > 12) {
    time[0] = time[0] - 12;
    time[2] = "PM"
  } else {
    time[2] = "AM"
  }

  return `${time[0]}:${time[1]} ${time[2]}`
}

export const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
}

export const isTomorrow = (someDate) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return someDate.getDate() === tomorrow.getDate() &&
    someDate.getFullYear() === tomorrow.getFullYear() &&
    someDate.getMonth() === tomorrow.getMonth()
}

export function getDeliverySlotStr(slot) {
  if (!slot) return ''

  if (slot === true) {
    return 'Now'
  }

  const type = formatDateType(slot.from)
  const from = formatTime(slot.from)
  // const to = formatTime(slot.to)

/*  if (from === '12:00 am' && to === '11:59 pm') {
    return type
  }*/

  return `${type}, ${from}`
}

export function getAssetsUrl(filename, type) {
  return filename;
}

export function openExternalLink(link) {
  window.open(link, "_system");
}

export function isNumeric(str) {
  if (typeof str == "number") return true
  if (typeof str != "string") return false
  return !isNaN(str) &&
    !isNaN(parseFloat(str))
}

export function isInt(value) {
  return !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10));
}

export function isPincode(pincode) {
  return /^[1-9][0-9]{5}$/g.test(pincode)
}

export function parseItem(item, isPrime, modifierPrice = 0) {
  if (item.isParsed) {
    return calculateDiscount(item, isPrime)
  }

  const image = item.image ?? (item.images ? item.images[0] : null)

  const price = {
    price: parseFloat(item['price']) + modifierPrice,
    oldPrice: null,
    discountStr: null,
    discountedAmount: null
  }

  const hasStock = ((item.stock > 0 || !item['maintainStock']) && item['isAvailable'])

  return calculateDiscount({
    id: item.id,
    name: item.name,
    image: image?.image,
    images: item.images?.map(v => getAssetsUrl(v.image, 'item')) ?? [],
    purchaseCount: item['purchaseCount'],
    reviewCount: item['reviewCount'],
    rating: item.rating,

    shortDescription: item['shortDescription'],
    description: item['description'],
    specification: item.specification,
    ratings: item['ratings'],
    wishId: item['wishlists'] ? item['wishlists'][0]?.id : null,

    hasStock,
    lowStockAlert: hasStock && (item.stock < 10 && item['maintainStock']),
    stock: parseInt(item.stock),

    isPack: item['isPack'],
    unit: item['unit'],

    price: price,

    isParsed: true,
    discounts: item.discounts.map(v => ({isPrime: v['customerType'] === "Prime", value: v.discountValue, type: v.discountType})),
    inCart: item.cart ? item.cart.qty : 0,

    modifiers: [],
    promoTag: null
  }, isPrime)
}

export function parseModifiers(modifiers) {
  if (!modifiers?.length) {
    return [];
  }

  return modifiers.map(v => {
    const cl = extend(true, {}, v)
    cl.selected = (v['details'].find(d => d.isDefault) ?? v['details'][0])
    return cl
  })
}

export function calculateDiscount(item, isPrime) {
  isPrime = !!isPrime

  let isPrimeDiscount = false
  let discount = item.discounts.find(v => v.isPrime === false)
  if (isPrime) {
    const dP = item.discounts.find(v => v.isPrime === true)
    if (dP) {
      discount = dP;
      isPrimeDiscount = true
    }
  }

  const price = {...item.price}
  if (discount) {
    const {type, value} = discount
    if (type === "Percent") {
      price.discountedAmount = (price.price * value / 100)
      price.discountStr = `${Math.round(value)}% off`
    } else {
      price.discountedAmount = value
      price.discountStr = `₹${Math.round(value)} off`
    }

    price.oldPrice = price.price
    price.price = price.price - price.discountedAmount
    price.isPrimeDiscount = isPrimeDiscount
  }

  return {...item, price}
}

export function calculateTotal(items, { deliveryCharge }) {
  let subTotal = 0;
  let grandTotal;
  let totalDiscount = 0;

  let realTotal = 0

  items.forEach(v => {
    realTotal += v.totalAmount
    subTotal += v.totalAmount + v.totalDiscount
    totalDiscount += v.totalDiscount
  })

  grandTotal = realTotal + parseFloat(deliveryCharge ?? 0)

  return {
    subTotal, totalDiscount, deliveryCharge, grandTotal, couponDiscount: null
  }
}

export function deepenObject(obj) {
  const result = {};

  for (const objectPath in obj) {
    const parts = objectPath.split('.');

    let target = result;
    while (parts.length > 1) {
      const part = parts.shift();
      target = target[part] = target[part] || {};
    }

    target[parts[0]] = obj[objectPath]
  }

  return result;
}
