<template>
  <q-page class="q-pa-md flex flex-center text-center" v-if="status === 1 && !loading">
    <div>
      <q-icon color="positive" size="xl" name="check"/>
      <p class="text-positive text-h5">Payment Success</p>
      <p class="text-h6">Your order has been placed and will be delivered shortly. You can track your order <router-link :to="`/order/${placedOrder.id}`" replace>here</router-link>.</p>
      <q-btn color="primary"  outline label="Go Home" to="/home" replace/>
      <p class="text-grey q-mt-lg">Note: This order is subject to item availability in nearby stores. If we cannot find the product amount will be refunded. Delivery person will contact you in case of any query.</p>
    </div>
  </q-page>
  <q-page class="q-pa-md flex flex-center text-center" v-if="status === 2 && !loading">
    <div>
      <q-icon color="positive" size="xl" name="check"/>
      <p class="text-positive text-h5">Order Placed</p>
      <p class="text-h6">Your order has been placed and will be delivered shortly. You can track your order <router-link :to="`/order/${placedOrder.id}`" replace>here</router-link>.</p>
      <q-btn color="primary"  outline label="Go Home" to="/home" replace/>
      <p class="text-grey q-mt-lg">Note: This order is subject to item availability in nearby stores. If we cannot find the product amount will be refunded. Delivery person will contact you in case of any query.</p>
    </div>
  </q-page>
  <q-page class="q-pa-md flex flex-center text-center" v-if="status === 0 && !loading">
    <div>
      <q-icon color="negative" size="xl" name="close"/>
      <p class="text-negative text-h5">Payment Failed</p>
      <p class="text-h6">If amount was deducted from your account please contact us to get refund.</p>
      <q-btn color="primary"  outline label="Go Home" to="/home" replace/>
    </div>
  </q-page>
  <q-page class="q-pa-md flex flex-center text-center" v-if="status === -1 || loading">
    <div>
      <q-spinner color="primary" size="xl"/>
      <p class="text-primary text-h5 q-mt-md">Processing Order</p>
    </div>
  </q-page>
</template>

<script setup>
import {useRouter} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {useStore} from "vuex";
import {api} from "boot/axios";
import {Checkout} from "capacitor-razorpay";
import ui from "src/ui";
import {useNavbar} from "src/composables/navbar";

const router = useRouter()
const store = useStore()

const status = ref(-1);
const loading = ref(false)

/** @type ComputedRef<IOrderCheckout>*/
const order = computed(() => store.state.cart.order)

const placedOrder = ref()

const {update} = useNavbar('no-menu ' + (status.value !== -1 ? 'back' : ''))

onMounted(async () => {
  await placeOrder()
})

async function placeOrder() {
  let orderRes = null;
  loading.value = true

  try {
    status.value = -1
    const res = await api.post('/order', {
      deliveryType: order.value.deliveryType,
      paymentMethod: order.value.paymentType.value,
      deliveryAddress:  order.value.deliveryAddress,
      couponCode: order.value.couponCode,
      items: order.value.items.map(v => v.id),
    })
    orderRes = res.data.data
    placedOrder.value = orderRes.order
  } catch (e) {
    console.log(e)
    loading.value = false
    ui.notifyError("Unable to process your order. If problem persists please contact us.")
    router.back()
    return
  }

  try {
    await store.dispatch("cart/fetchCart")
  } catch (e) {
  }

  if (!orderRes['paymentRequest']) {
    status.value = 2
    loading.value = false
    return;
  }

  let payment = null;

  Checkout.open(orderRes['paymentRequest'])
    .then((data) => {
      if (data.response) {
        payment = {...data.response, status: 'success'}
        savePaymentReq(payment)
      } else {
        payment = {razorpay_order_id: orderRes['paymentRequest']['order_id'], status: 'failure'}
        savePaymentReq(payment)
      }
    })
    .catch(() => {
      payment = {razorpay_order_id: orderRes['paymentRequest']['order_id'], status: 'failure'}
      savePaymentReq(payment)
    })
}

async function savePaymentReq(payment) {
  try {
    loading.value = true
    await savePayment(payment)
    status.value = payment.status === "success" ? 1 : 0
    await store.dispatch("cart/finishOrder")
  } catch (e) {
    status.value = 0
  } finally {
    loading.value = false
  }
}

async function savePayment(payment = null) {
  await api.patch('order/payment', payment)
}
</script>

<style lang="scss" scoped>

</style>
