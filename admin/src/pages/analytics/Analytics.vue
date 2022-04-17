<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-3">
        <DatePicker outlined stack-label label="From Date" v-model="where.from" clearable/>
      </div>
      <div class="col-3">
        <DatePicker outlined stack-label label="To Date" v-model="where.to" clearable/>
      </div>
      <div class="col-3">
        <SelectCategory outlined stack-label clearable label="Category" emit-value v-model="where.category"/>
      </div>
      <div class="col-3">
        <SelectItem outlined stack-label clearable label="Item" emit-value v-model="where.item" :filter="{_categoryId: where.category}"/>
      </div>
      <div class="col-3">
        <SelectLocation outlined stack-label clearable label="Location" emit-value v-model="where.location"/>
      </div>
      <div class="col-3">
        <SelectCustomer outlined stack-label clearable label="Customer" emit-value v-model="where.customer"/>
      </div>
    </div>
    <q-separator class="q-mb-md"/>
    <div class="row q-mb-md">
      <div class="flex stats-container">
        <StatBox class="" :title="stat.title" :value="stat.value" v-for="stat in stats"/>
      </div>
    </div>
    <q-separator class="q-mb-md"/>

    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-6" v-if="!where.customer">
        <StatsTable title="Top Customers" :where="where" type="customer"/>
      </div>
      <div class="col-6" v-if="!where.item">
        <StatsTable title="Top Items" :where="where" type="item"/>
      </div>
      <div class="col-6" v-if="!where.location">
        <StatsTable title="Top Locations" :where="where" type="location"/>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {api} from "boot/axios";
import ui from "src/ui";
import {onMounted, reactive, ref, watch} from "vue";
import StatBox from './components/StatBox'
import DatePicker from "components/DatePicker";
import SelectItem from "components/select/SelectItem";
import SelectCategory from "components/select/SelectCategory";
import SelectLocation from "components/select/SelectLocation";
import SelectCustomer from "components/select/SelectCustomer";
import StatsTable from "pages/analytics/components/StatsTable";

const loading = ref()
const stats = ref()

const where = reactive({
  from: "",
  to: "",
  item: "",
  category: "",
  location: "",
  customer: ""
})

const fieldMapping = {
  '@@totalCount': 'Orders',
  '@@totalAmount': 'Total Amount',
  '@@totalDiscount': 'Total Discount',
  '@@averageAmount': 'Avg. Amount',
  '@@averageDiscount': 'Avg. Discount',
  '@@minAmount': 'Min. Amount',
  '@@minDiscount': 'Min. Discount',
  '@@maxAmount': 'Max. Amount',
  '@@maxDiscount': 'Max. Discount',
  '@@totalCancelledCount': 'Cancelled Orders',
  '@@totalCouponClaimCount': 'Coupons Claimed',
  '@@totalCouponAmount': 'Total Coupon Discount',
  '@@averageCouponAmount': 'Avg. Coupon Discount',
  '@@minCouponAmount': 'Min. Coupon Discount',
  '@@maxCouponAmount': 'Max. Coupon Discount',
  '@@newCustomers': 'New Customers',
  '@@newMessages': 'New Messages',
}

watch(where, () => load())

watch(loading, () => {
  if (loading.value) {
    ui.showLoader("Please wait... This may take some minutes")
  } else {
    ui.hideLoader()
  }
})

async function load() {
  loading.value = true
  try {
    const data = await api.post('/analytics', {where})

    const st = []
    for (const [key, value] of Object.entries(fieldMapping)) {
      st.push({
        title: value,
        value: typeof data.data.data[0][key] === "string" ? 0 : data.data.data[0][key]
      })
    }

    stats.value = st
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const st = []
  for (const [key, value] of Object.entries(fieldMapping)) {
    st.push({
      title: value,
      value: 0
    })
  }

  stats.value = st
})

onMounted(() => load())
</script>

<style lang="scss" scoped>
.stats-container {
  justify-content: space-evenly;
}
</style>
