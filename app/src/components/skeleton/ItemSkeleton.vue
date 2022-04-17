<template>
  <q-page>
    <q-card>
      <q-card-section class="q-pa-none relative-position">
        <q-skeleton square width="100%" height="250px"/>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-sm">
      <q-card-section>
        <div class="product-info">
          <q-skeleton width="80%"/>
          <div class="row q-gutter-sm q-mt-xs">
            <q-skeleton width="40px"/>&nbsp;<q-skeleton width="80px"/>
          </div>
          <div class="row q-mt-xs">
            <q-skeleton width="50px"/>&nbsp;<q-skeleton width="50px"/>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-sm">
      <q-card-section>
        <div class="row">
          <q-skeleton width="75px"/>&nbsp;<q-skeleton width="75px"/>
        </div>
        <q-separator class="q-mt-md" />
        <q-skeleton type="text" class="q-mt-md q-mb-xs" width="100%"/>
        <q-skeleton type="text" class="q-mb-xs" width="100%"/>
        <q-skeleton type="text" class="q-mb-xs" width="100%"/>
        <q-skeleton type="text" class="q-mb-xs" width="75%"/>
      </q-card-section>
    </q-card>

    <CurrentLocationSkeleton class="q-mt-sm"/>

    <ReviewsCardSkeleton class="q-mt-sm"/>
  </q-page>
</template>

<script setup>

import CurrentLocationSkeleton from "components/skeleton/CurrentLocationSkeleton";
import ReviewsCardSkeleton from "components/skeleton/ReviewsCardSkeleton";
</script>

<style lang="scss" scoped>

</style>
