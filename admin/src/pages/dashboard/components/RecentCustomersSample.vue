<template>
  <h6 class="q-mb-sm q-mt-none">Recent Customers</h6>
  <q-list bordered separator>
    <q-item v-for="customer in customers" clickable v-ripple :to="'/customer/' + customer.id" exact>
      <q-item-section>
        <q-item-label>{{ customer.name }}</q-item-label>
        <q-item-label caption lines="1">{{ customer.phone }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/customer">
      <q-item-section class="text-center text-primary">
        View More
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
defineProps({
  customers: Array
})
</script>

<style lang="scss" scoped>

</style>
