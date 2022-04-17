<template>
  <q-pull-to-refresh @refresh="fetchOrder" ref="refreshRef">
    <q-page class="q-pa-sm" ref="pageRef">
      <div v-if="order">
        <p class="q-mt-md text-center" v-html="getInfoText(order)"/>
<!--        <p class="q-mt-md text-center" v-if="['Pending', 'Processing'].includes(order.status) && order.expected_delivery_time">Delivery: <b class="text-positive">{{ getDeliverySlotStr({ from: order.expected_delivery_time }) }}</b></p>-->

        <div v-if="order.assignedTo">
          <p class="text-grey q-mt-md q-mb-none">Your order will be delivered by</p>
          <q-list separator bordered>
            <q-item tag="label" clickable v-ripple>
              <q-item-section>
                <q-item-label>{{ order.assignedTo.name }}</q-item-label>
                <q-item-label caption>+91 {{ order.assignedTo.phone }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <p class="text-grey q-mt-md q-mb-none">Items in this order</p>
        <q-list separator bordered>
          <q-item tag="label" clickable v-ripple :to="`/item/` + item['_itemId']" v-for="item in order['details']">
            <q-item-section avatar>
              <q-img :src="getAssetsUrl(item.item.images?.find(v => v.isDefault)?.image)" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item['itemName'] }}</q-item-label>
              <q-item-label caption><q-badge color="secondary" :label="formatQty(item.qty)"/> x {{ formatCurrency(item['price']) }}</q-item-label>
            </q-item-section>
            <q-item-section>
            </q-item-section>
            <q-item-section side>
              <q-badge color="negative" :label="item.status" v-if="item.status === 'Cancelled'"/>
              <span v-else>{{ formatCurrency(item.amount) }}</span>
            </q-item-section>
          </q-item>
        </q-list>

        <OrderPricingTable class="q-mt-md" :pricing="pricing" v-if="pricing"/>

        <q-list class="q-mt-md" separator bordered v-if="paymentStatus">
          <q-item tag="label" clickable v-ripple>
            <q-item-section>
              <q-item-label caption>Payment Status</q-item-label>
              <q-item-label><q-badge :color="paymentStatus.color" :label="paymentStatus.status"/></q-item-label>
            </q-item-section>
          </q-item>
          <q-item tag="label" clickable v-ripple>
            <q-item-section>
              <q-item-label caption>{{ paymentStatus.caption }} Amount</q-item-label>
              <q-item-label><b>{{ formatCurrency(paymentStatus.amount) }}</b></q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="order['status'] !== 'Cancelled' && order['amountBalance'] > 0">
            <q-item-section>
              <q-item-label class="text-center">
                <q-btn unelevated color="primary" label="Pay Now" @click="payNow" :loading="loadingPayment"/>
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="order['amountBalance'] > 0 && order['status'] === 'Waiting'">
              <q-item-label class="text-center">
                <q-btn flat color="primary" label="Pay Later" @click="payLater" :loading="loadingPaymentLater"/>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>


        <q-list class="q-mt-md" separator bordered>
          <q-item tag="label" clickable v-ripple>
            <q-item-section>
              <q-item-label caption>Delivery Type</q-item-label>
              <q-item-label>Home Delivery</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" clickable v-ripple>
            <q-item-section>
              <q-item-label caption>Delivery Charge</q-item-label>
              <q-item-label>{{ formatCurrency(order['amountDelivery']) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" clickable v-ripple>
            <q-item-section>
              <q-item-label caption>Delivery Address</q-item-label>
              <q-item-label>
                <div class="name">{{ address.name }}</div>
                <div class="address">
                  <span>{{ address.street }}, </span>
                  <span v-if="address.landmark">{{ address.landmark }}, </span>
                  <span>{{ address.address1 }}, </span>
                  <span v-if="address.address2">{{ address.address2 }}, </span>
                  <span>{{ address.city }} - {{ address.pincode }}</span>
                </div>
                <div class="mobile text-bold">+91 {{ address.phone }}</div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card flat bordered class="q-mt-md" v-if="canCancelStatus.includes(order.status) || order.status !== 'Cancelled'">
          <q-card-section v-if="canCancelStatus.includes(order.status)">
            <q-btn class="full-width" label="cancel order" color="negative" unelevated :loading="cancelling" @click="cancelOrder"/>
          </q-card-section>
          <q-card-section v-else-if="order.status !== 'Cancelled'">
            <p class="text-center text-secondary q-ma-none">You cannot cancel this order</p>
          </q-card-section>
        </q-card>
      </div>

      <q-inner-loading :showing="loading">
        <q-spinner-bars size="50px" color="primary"/>
      </q-inner-loading>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {api} from "boot/axios";
import {useRoute} from "vue-router";
import ui from "src/ui";
import {formatDate, formatTime, isToday, getAssetsUrl, formatCurrency, formatQty, getDeliverySlotStr} from "src/js/utils";
import OrderPricingTable from "components/OrderPricingTable";
import {useStore} from "vuex";
import {useNavbar} from "src/composables/navbar";

const route = useRoute()
const store = useStore()

const {title} = useNavbar('back search cart auth')

const loading = ref(true)
const loadingPayment = ref(false)
const loadingPaymentLater = ref(false)
const cancelling = ref(false)
const order = ref()
const refreshRef = ref()

const pricing = computed(() => {
  if (!order.value) return null

  return {
    subTotal: order.value['amountItems'],
    totalDiscount: order.value['amountDiscount'],
    deliveryCharge: order.value['amountDelivery'],
    grandTotal: order.value['amountTotal'],
    couponDiscount: order.value['amountPromotion']
  }
})

/** @type ComputedRef<IAddress> */
const address = computed(() => {
  if (!order.value) return null
  return order.value['address']
})

watch(order, () => title.value = order.value && ("Order #" + order.value.id), {deep: true})

const canCancelStatus = ['Pending', 'Processing', 'Waiting']

onMounted(() => {
  refreshRef.value.trigger()
})

async function fetchOrder(done) {
  try {
    loading.value = true
    const select = ['amountPaid', 'amountRefunded', 'amountBalance', 'status', 'statusChangedAt',
      'id', 'amountItems', 'amountDiscount', 'amountDelivery', 'amountTotal', 'amountPromotion']
    const include = ['address', 'details:_itemId,itemName,qty,amount,status,price', 'assignedTo:name,phone', 'details.item:id', 'details.item.images']

    const res = await api.get('order/' + route.params.id + '?select=' + select.join(',') + '&include=' + include.join(';'));
    order.value = res.data.data.order;
  } catch (e) {
    ui.notifyError("Unable to load order")
  } finally {
    loading.value = false
    done()
  }
}


function getInfoText(order) {
  let date = null;

  if (isToday(new Date(order['statusChangedAt']))) {
    date = formatTime(order['statusChangedAt'])
  } else {
    date = formatDate(order['statusChangedAt'])
  }

  switch (order['status']) {
    case 'Waiting':
      return `<b class="text-negative">Payment Failed</b> on ${date}. Please retry the payment. Order will be placed after payment is completed.`

    case 'Cancelled':
      return `<b class="text-negative">Cancelled</b> on ${date}`

    case 'Delivered':
      return `<b class="text-postitive">Delivered</b> on ${date}`

    case 'Pending':
      return `Your order is <b class="text-info">Placed</b> on ${date}`

    case 'Processing':
      return `We are <b class="text-warning">Processing</b> your order`

    case 'Dispatched':
      return `<b class="text-warning">Dispatched</b> on ${date}`
  }
}

async function payNow() {
  try {
    loadingPayment.value = true
    const res = await api.post(`order/${order.value.id}/pay`)
    const status = await store.dispatch("cart/payForOrder", res.data.data.paymentRequest)

    if (status === "success") {
      ui.notifySuccess("Payment Successful")
    } else {
      ui.notifyError("Payment Failed")
    }
  } catch (e) {
    ui.notifyError("Payment Failed")
  } finally {
    loadingPayment.value = false
    refreshRef.value.trigger()
  }
}

async function payLater() {
  try {
    loadingPaymentLater.value = true
    await api.post(`order/${order.value.id}/pay/later`)
    ui.notifySuccess("Order Placed")
  } catch (e) {
    ui.notifyError("Payment Failed")
  } finally {
    loadingPaymentLater.value = false
    refreshRef.value.trigger()
  }
}


async function cancelOrder() {
  const re = getRefundFee()
  const balance = order.value.amountPaid - order.value.amountRefunded

  let message = "Do you want to cancel the order?<br>"
  if (balance) {
    message += "<i>The paid amount will be refunded.</i> "
    if (re) {
      message += `<i>Processing fee of <b>${formatCurrency(re)}</b> will be deducted</i>`
    }
  }

  try {
    await ui.confirm({
      title: 'Cancel Order',
      message,
      html: true,
      cancel: true,
      color: 'negative',
      persistent: true
    })
  } catch {
    return
  }

  try {
    cancelling.value = true
    await api.post(`order/${order.value.id}/cancel`)

    refreshRef.value.trigger()
    ui.notifySuccess("Order Cancelled")
  } catch (e) {
    ui.notifyError("Unable to cancel the order. Try again. If problem persists contact us.")
  } finally {
    cancelling.value = false
  }
}

function getRefundFee() {
  const settings = store.state.app.settings
  const balance = order.value.amountPaid - order.value.amountRefunded

  if (settings['payment.refund.fee.min']) {
      let fee = settings['payment.refund.fee.min'];
      const type = settings['payment.refund.fee.type'] ?? 'Percent';
      const max = settings['payment.refund.fee.max'] ?? 0;

      if (type === 'Percent') {
        fee = (fee * balance) / 100;
      }

      if (max && fee > max) {
        fee = max;
      }

      return fee
  }

  return 0;
}

const paymentStatus = computed(() => {
  if (!order.value) return null

  if (order.value.amountBalance > 0) {
    return {
      caption: 'Payable',
      amount: order.value.amountBalance,
      status: 'Not Paid',
      color: 'warning'
    }
  }

  if (order.value.amountBalance < 0) {
    return {
      caption: 'Refundable',
      amount: -order.value.amountBalance,
      status: 'Refund',
      color: 'accent'
    }
  }

  if (order.value.amountPaid === order.value.amountRefunded) {
    return {
      caption: 'Refunded',
      amount: order.value.amountRefunded,
      status: 'Refunded',
      color: 'accent'
    }
  }

  return {
    caption: 'Paid',
    amount: order.value.amountPaid,
    status: 'Paid',
    color: 'positive'
  }
})
</script>

<style lang="scss" scoped>

</style>
