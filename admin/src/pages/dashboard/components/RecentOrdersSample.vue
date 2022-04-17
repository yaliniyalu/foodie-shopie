<template>
  <h6 class="q-mb-sm q-mt-none">Recent Orders</h6>
  <q-list bordered separator>
    <q-item v-for="order in orders" clickable v-ripple :to="'/order/' + order.id" exact>
      <q-item-section>
        <q-item-label>#{{ order.id }}</q-item-label>
        <q-item-label caption>
          <StatusBadge :options="OrderStatus" :value="order.status"/>
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        {{ formatCurrency(order.amountTotal) }}
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/order">
      <q-item-section class="text-center text-primary">
        View More
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import {formatCurrency} from "src/js/utils";
import {OrderStatus} from "src/js/model-helpers/orders";
import StatusBadge from "components/badge/StatusBadge";

defineProps({
  orders: Array
})
</script>

<style lang="scss" scoped>

</style>
