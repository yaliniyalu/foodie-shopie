<template>
  <q-page class="q-pa-md q-gutter-md">
    <template v-if="summary">
        <q-list separator bordered>
          <q-item tag="label" clickable v-ripple v-for="c in items">
            <q-item-section avatar>
              <q-img :src="getAssetsUrl(c.item.image)" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ c.item.name }}</q-item-label>
              <q-item-label caption><q-badge color="secondary" :label="c.qty"/> x {{ formatCurrency(c.item.price.price) }} <span class="text-grey">/{{ c.item.unit }}</span></q-item-label>
            </q-item-section>
            <q-item-section side>
              {{ formatCurrency(c.totalAmount) }}
            </q-item-section>
          </q-item>
        </q-list>
    </template>

    <OrderPricingTable :pricing="pricing" v-if="pricing"/>

    <q-form v-if="summary && (!summary.couponDetails || summary.couponDetails.status !== 'APPLIED')">
      <q-input outlined stack-label label="Promo Code" dense v-model="couponCode" :error="!!couponCodeError" :error-message="couponCodeError" :readonly="couponLoading">
        <template v-slot:after>
          <q-btn type="submit" color="primary" unelevated label="apply" @click="applyCoupon" :loading="couponLoading"/>
        </template>
      </q-input>
    </q-form>

    <q-card bordered flat v-if="summary && summary.couponDetails && summary.couponDetails.status === 'APPLIED'">
      <q-card-section>
        Promo Applied: <b>{{ summary.couponDetails.coupon.code }}</b> <q-btn icon="delete" flat round color="negative" @click="removeCoupon"/>
      </q-card-section>
    </q-card>

    <q-list separator bordered>
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
      <q-item class="flex flex-center">
        <q-btn unelevated color="primary" label="Change Address" @click="changeAddress"/>
      </q-item>
    </q-list>

    <div>
      <p class="text-bold q-mb-xs">Payment Type</p>
      <q-list dense separator bordered>
        <q-item dense tag="label" clickable v-ripple :active="selectedPayment === pt.id" v-for="pt in paymentsType" @click="selectedPayment = pt.id">
          <q-item-section avatar>
            <q-icon :name="pt.icon" />
          </q-item-section>
          <q-item-section>
            {{ pt.name }}
          </q-item-section>
          <q-item-section avatar>
            <q-radio v-model="selectedPayment" :val="pt.id"/>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-list separator bordered>
      <q-item tag="label" clickable v-ripple @click="acceptTerms = !acceptTerms">
        <q-item-section avatar>
          <q-checkbox v-model="acceptTerms" :val="true"/>
        </q-item-section>
        <q-item-section>
          <q-item-label>I accept the <a href="#" @click.prevent.stop="openPage('privacy')">privacy policy</a> and <a href="#" @click.prevent.stop="openPage('terms')">terms of conditions</a></q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="text-center">
      <q-btn unelevated :label="`Place order` + (order.paymentType.id !== 'cash' ? ' & Pay' : '')" color="secondary" @click="placeOrder" :disable="!acceptTerms" :loading="loading"/>
    </div>

    <p class="text-grey text-center full-width q-mt-lg q-mb-sm">Your payments will be securely processed through razorpay</p>

    <q-inner-loading :showing="loading">
      <q-spinner-bars size="50px" color="primary"/>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {computed, onMounted, ref, watch} from "vue";
import NavBar from "components/NavBar";
import {formatSlotTime, formatCurrency, getAssetsUrl, getDeliverySlotStr} from "src/js/utils";
import {api} from "boot/axios";
import ui from "src/ui";
import {useQuasar} from "quasar";
import OrderPricingTable from "components/OrderPricingTable";
import {useNavbar} from "src/composables/navbar";

const quasar = useQuasar()
const store = useStore()
const router = useRouter()

/** @type ComputedRef<IOrderCheckout>*/
const order = computed(() => store.state.cart.order)

/** @type ComputedRef<Array<ICartItem>>*/
const items = computed(() => order.value.items)

/** @type ComputedRef<IAddress>*/
const address = computed(() => order.value.deliveryAddress)

/** @type ComputedRef<ICartTotal>*/
const pricing = computed(() => summary.value?.pricingDetails)
const coupon = computed(() => summary.value?.couponDetails)

const acceptTerms = ref(false)
const loading = ref(false)
const couponCode = ref()
const couponCodeError = ref()
const couponLoading = ref()

/** @type ComputedRef<IOrderSummary>*/
const summary = ref()

useNavbar('back', "Order Summary")

onMounted(() => {
  loadSummary()
})

const itemIds = items.value.map(v => v.id)

async function loadSummary() {
  try {
    loading.value = true;
    const res = await api.post('order/summary', {items: itemIds, pincode: address.value.pincode, coupon: couponCode.value})
    summary.value = res.data.data

    console.log(summary.value)

    if (!summary.value.locationDetails.isDeliverable) {
      quasar.dialog({
        message: "Orders cannot be delivered to pincode: <b>" + address.value.pincode + "</b>",
        color: 'negative',
        html: true
      }).onOk(() => {
        cancelCheckout()
      })
    }
  } catch (e) {
    ui.notifyError("Unexpected error occurred. Please try again.")
    router.back()
  } finally {
    loading.value = false
  }
}

async function applyCoupon() {
  couponLoading.value = true
  couponCodeError.value = null
  try {
    const res = await api.patch('cart/coupon', {
      items: itemIds, coupon: couponCode.value
    })
    if (res.data.data.status === 'APPLIED') {
      await store.dispatch("cart/setOrderDetails", {type: 'couponCode', value: couponCode.value})
      await loadSummary()
    }
    else {
      couponCodeError.value = res.data.data.message
    }
  } catch (e) {
    return e.message
  } finally {
    couponLoading.value = false
  }
}

async function removeCoupon() {
  couponCode.value = null
  couponCodeError.value = null
  await store.dispatch("cart/setOrderDetails", {type: 'couponCode', value: null})
  await loadSummary()
}

async function cancelCheckout() {
  router.back();
}

async function placeOrder() {
  await router.replace("/checkout/status")
}

function openPage(page) {
  store.dispatch("app/openPage", { page })
}

const paymentsType = [
  { name: "Cash on Delivery", value: "cash", id: 'cash', icon: 'attach_money' },
  { name: "Credit/Debit Card", value: "card", id: 'credit_card', icon: 'credit_card' },
  { name: "UPI", value: "upi", id: 'upi', icon: 'smartphone' },
  { name: "Net Banking", value: "netbanking", id: 'net_banking', icon: 'account_balance' },
]

const selectedPayment = ref(paymentsType[0].id) // Cash on delivery default
watch(selectedPayment, () => savePaymentType(), {immediate: true})

async function savePaymentType() {
  await store.dispatch("cart/setOrderDetails", {type: "paymentType", value: paymentsType.find(v => v.id === selectedPayment.value)})
}

function changeAddress() {
  router.push({ path: '/checkout/address', query: { from: 'summary' } })
}
</script>

<style lang="scss" scoped>

</style>
