<template>
  <h6 class="q-mb-sm q-mt-none">Top Selling Items</h6>
  <q-list bordered separator>
    <q-item v-for="item in items" clickable v-ripple :to="'/item/' + item.id" exact>
      <q-item-section avatar>
        <q-avatar>
          <img :src="item.image">
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
        <q-item-label caption>{{ item.categoryName }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        {{ item.total }}
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/item">
      <q-item-section class="text-center text-primary">
        View More
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
defineProps({
  items: Array
})
</script>

<style lang="scss" scoped>

</style>
