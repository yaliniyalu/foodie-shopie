<template>
  <h6 class="q-mb-sm q-mt-none">Recent Reviews</h6>
  <q-list bordered separator>
    <q-item v-for="review in reviews" clickable v-ripple :to="'/review/' + review.id" exact>
      <q-item-section avatar>
        <q-avatar>
          <img :src="review.itemImage">
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ review.itemName }}</q-item-label>
        <q-item-label caption lines="2">{{ review.review }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <RatingStarBadge :value="review.rating" star/>
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/review">
      <q-item-section class="text-center text-primary">
        View More
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import RatingStarBadge from "components/badge/RatingStarBadge";

defineProps({
  reviews: Array
})
</script>

<style lang="scss" scoped>

</style>
