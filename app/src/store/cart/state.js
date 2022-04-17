export default function () {
  return {
    items: [],
    wishlist: [],
    deliveryLocation: {
      isDeliverable: false,
      location: null,
      fee: 0
    },
    timeSlot: {
      isAvailable: false,
      currentSlot: null,
      nextSlot: null,
      slots: []
    },
    order: {
      deliveryAddress: null,
      deliveryType: "Home Delivery",
      deliveryCharge: 0,
      paymentType: null,
      items: [],
      couponCode: null
    }
  }
}
