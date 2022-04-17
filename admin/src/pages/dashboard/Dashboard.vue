<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col-12 flex justify-end">
        <q-btn-toggle
          v-model="range"
          toggle-color="primary"
          :options="RangeOptions"
          rounded
          unelevated
        />
      </div>
    </div>

    <div class="row q-mb-md q-col-gutter-md" v-if="stat">
      <div class="col-3">
        <InfoTile title="Sales" :value="stat.sales.curr" :prev-value="stat.sales.prev" to="/order" color="teal-10" icon="attach_money" />
      </div>
      <div class="col-3">
        <InfoTile title="Orders" :value="stat.orders.curr" :prev-value="stat.orders.prev" to="/order" color="purple-10" icon="shopping_cart" />
      </div>
      <div class="col-3">
        <InfoTile title="Avg. Sales" :value="stat.sales_avg.curr" :prev-value="stat.sales_avg.prev" to="/order" color="cyan-10" icon="paid" />
      </div>
      <div class="col-3">
        <InfoTile title="New Customers" :value="stat.customers.curr" :prev-value="stat.customers.prev" to="/customer" color="green-10" icon="people" />
      </div>
    </div>

    <div class="row q-mb-md q-col-gutter-md" v-if="graph">
      <div class="col-9">
        <LineChart title="Orders" :data="graph.orders" tooltip-formatter="{b} <br/>{c}"/>
      </div>
      <div class="col-3">
        <TopSellingItemsSample :items="sample.topSelling"/>
      </div>
      <div class="col-6">
        <LineChart title="Sales" :data="graph.sales" tooltip-formatter="{b} <br/>₹{c}"/>
      </div>
      <div class="col-6">
        <LineChart title="Avg. Sales" :data="graph.sales_avg" tooltip-formatter="{b} <br/>₹{c}"/>
      </div>
      <div class="col-6">
        <LineChart title="New Customers" :data="graph.customers" tooltip-formatter="{b} <br/>{c} customers"/>
      </div>
      <div class="col-3">
        <RecentReviewsSample :reviews="sample.recentReviews"/>
      </div>
      <div class="col-3">
        <RecentOrdersSample :orders="sample.recentOrders"/>
      </div>
<!--      <div class="col-3">
        <RecentCustomersSample :customers="sample.recent_customers"/>
      </div>-->
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-cube :size="50" color="primary"/>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import LineChart from "pages/dashboard/components/LineChart";
import InfoTile from "pages/dashboard/components/InfoTile";
import {onMounted, ref, watch} from "vue";
import {api} from "boot/axios";
import RecentReviewsSample from "pages/dashboard/components/RecentReviewsSample";
import RecentCustomersSample from "pages/dashboard/components/RecentCustomersSample";
import RecentOrdersSample from "pages/dashboard/components/RecentOrdersSample";
import TopSellingItemsSample from "pages/dashboard/components/TopSellingItemsSample";
import ui from "src/ui";

const loading = ref()

const stat = ref(null)
const graph = ref(null)
const sample = ref(null)

const RangeOptions = [
  {label: 'Yesterday', value: 'yesterday'},
  {label: 'Today', value: 'day'},
  {label: 'This Week', value: 'week'},
  {label: 'This Month', value: 'month'},
  {label: 'This Year', value: 'year'}
]

const range = ref('day')

watch(range, () => load(), {immediate: true})

async function load() {
  loading.value = true
  try {
    const res = await api.get('dashboard?range=' + range.value)
    stat.value = res.data.data.statistics
    graph.value = res.data.data.graph
    sample.value = res.data.data.sample
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
