<template>
  <q-pull-to-refresh @refresh="refreshOrders" ref="refreshRef">
    <q-page class="q-pa-sm" ref="pageRef">
      <q-infinite-scroll @load="loadMoreOrders" :offset="250" ref="infiniteRef" :scroll-target="pageRef" :initial-index="0">

        <q-list bordered separator v-if="orders.length">
          <q-item clickable v-ripple :to="`/order/${order.id}`" v-for="order in orders">
            <q-item-section>
              <q-item-label>Order #{{order.id}}</q-item-label>
              <q-item-label caption>{{ order.itemsCount }} items</q-item-label>
              <q-item-label caption><q-icon name="event"/> {{ formatDate(order.createdAt) }}</q-item-label>
              <q-item-label caption>
                <q-badge :label="getStatus(order)" :color="getStatusColor(order.status)"/>
              </q-item-label>
            </q-item-section>
            <q-item-section top side>{{formatCurrency(order.amountTotal)}}</q-item-section>
          </q-item>
        </q-list>

        <template v-slot:loading>
          <q-list bordered separator>
            <q-item v-for="i in 10">
              <q-item-section>
                <q-item-label><q-skeleton type="text" width="75%"/></q-item-label>
                <q-item-label caption><q-skeleton type="rect" width="25%" /></q-item-label>
                <q-item-label caption><q-skeleton type="text" width="30%" /></q-item-label>
                <q-item-label caption><q-skeleton type="rect" width="50px"/></q-item-label>
              </q-item-section>
              <q-item-section top side><q-skeleton type="text" width="25px"/></q-item-section>
            </q-item>
          </q-list>
        </template>

        <div class="center-in-page flex flex-center column q-pa-lg" v-if="!loading && !orders.length">
          <q-icon size="xl" color="grey" name="shopping_bag"/>
          <p class="text-grey text-center q-mt-md">You haven't placed any order yet.<br/>Place an order to see it here.</p>
          <q-btn color="primary" flat label="Shop Now" to="/items"/>
        </div>
      </q-infinite-scroll>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import {api} from "boot/axios";
import {formatCurrency,formatDate} from "src/js/utils";
import {useNavbar} from "src/composables/navbar";

const pageRef = ref()
const infiniteRef = ref()
const loading = ref(false)
const hasMore = ref(true)
const orders = ref([])

const LIMIT = 24;

useNavbar('back search cart auth', "My Orders")

watch(hasMore, () => {
  if (hasMore.value) {
    infiniteRef.value.resume();
  } else {
    infiniteRef.value.stop();
  }
})

onMounted(() => {
  infiniteRef.value.reset();
  infiniteRef.value.trigger();
})

function refreshOrders(done) {
  infiniteRef.value.reset();
  hasMore.value = true
  orders.value = []
  infiniteRef.value.trigger();
  done()
}

async function loadMoreOrders(index, done) {
  if (!hasMore.value || loading.value) {
    return;
  }

  try {
    await fetchOrders(index)
  } finally {
    done();
  }
}

async function fetchOrders(page) {
  try {
    loading.value = true
    const res = await api.get('order?' + getQuery(page));
    orders.value.push(...res.data.data.orders);
    if (!res.data.data.orders.length || res.data.data.orders.length < LIMIT) {
      hasMore.value = false
    }
  } catch (e) {
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

function getStatus(order) {
  if (order.status === 'Waiting') return "Payment Pending"
  return order.status
}

function getStatusColor(status) {
  switch (status) {
    case 'Cancelled':
      return 'negative'

    case 'Delivered':
      return 'positive'

    case 'Pending':
      return 'info'

    case 'Waiting':
    case 'Processing':
    case 'Dispatched':
      return 'warning'
  }
}

function getQuery(page) {
  const query = [];

  query.push(`select=${['id', 'amountTotal', 'itemsCount', 'status', 'paymentStatus', 'createdAt']}`)
  query.push(`sortByDesc=id`)
  query.push(`limit=${LIMIT}`)
  query.push(`page=${page}`)

  return query.join('&')
}
</script>

<style lang="scss" scoped>

</style>
