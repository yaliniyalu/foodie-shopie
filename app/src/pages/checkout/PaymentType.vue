<template>
  <q-page class="q-pa-md q-gutter-md">
    <q-list separator bordered>
      <q-item tag="label" clickable v-ripple :active="selected === pt.id" v-for="pt in paymentsType" @click="selected = pt.id">
        <q-item-section avatar>
          <q-icon :name="pt.icon" />
        </q-item-section>
        <q-item-section>
          {{ pt.name }}
        </q-item-section>
        <q-item-section avatar>
          <q-radio v-model="selected" :val="pt.id"/>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="text-center">
      <q-btn unelevated label="Continue" color="secondary" @click="savePaymentType"/>
    </div>
  </q-page>

  <q-footer class="bg-white">
    <q-toolbar>
      <p class="text-grey text-center full-width">Your payments will be securely processed through razorpay</p>
    </q-toolbar>
  </q-footer>
</template>

<script setup>
import NavBar from "components/NavBar";
import {ref} from "vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {useNavbar} from "src/composables/navbar";

const store = useStore()
const router = useRouter()

const paymentsType = [
  { name: "Cash on Delivery", value: "cash", id: 'cash', icon: 'attach_money' },
  { name: "Credit Card", value: "card", id: 'credit_card', icon: 'credit_card' },
  { name: "Debit Card", value: "card", id: 'debit_card', icon: 'local_atm' },
  { name: "UPI", value: "upi", id: 'upi', icon: 'smartphone' },
  { name: "Net Banking", value: "netbanking", id: 'net_banking', icon: 'account_balance' },
]

const selected = ref(paymentsType[0].id) // Cash on delivery default

useNavbar('back', "Payment Type")

async function savePaymentType() {
  await store.dispatch("cart/setOrderDetails", {type: "paymentType", value: paymentsType.find(v => v.id === selected.value)})
  await router.replace("/checkout/summary")
}
</script>

<style lang="scss" scoped>

</style>
