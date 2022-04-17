<template>
  <q-card>
    <q-card-section class="flex items-center justify-between">
      <q-skeleton width="40%"/><q-skeleton width="60px"/>
    </q-card-section>

    <q-card-section>
      <RatingCardSkeleton/>
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <div class="q-mt-xs q-mb-sm" v-for="r in 3">
        <div class="flex justify-between">
          <q-skeleton type="text" width="30px"/>
          <q-skeleton type="text" width="80px"/>
        </div>
        <p class="q-mt-xs q-ma-none q-gutter-xs">
          <q-skeleton type="text" width="100%"/>
          <q-skeleton type="text" width="100%"/>
          <q-skeleton type="text" width="75%"/>
        </p>

        <q-separator class="q-mt-xs"/>
      </div>

      <div class="flex flex-center">
        <q-skeleton width="40%"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>

import RatingCardSkeleton from "components/skeleton/RatingCardSkeleton";
</script>

<style lang="scss" scoped>

</style>
