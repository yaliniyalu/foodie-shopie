<template>
  <div>
    <div class="flex justify-between">
      <q-skeleton type="rect" height="25px" width="50%" />
      <q-skeleton type="rect" height="25px" width="25px" />
    </div>
    <swiper class="q-mt-sm" :slides-per-view="3" :space-between="5" :breakpoints="breakpoints">
      <swiper-slide class="item" v-for="i in 6">
        <q-skeleton type="rect" height="120px" />
        <div class="info-wrapper">
          <q-skeleton type="text" width="90%" />
          <div class="flex q-gutter-md">
            <q-skeleton type="text" width="25px" />
            <q-skeleton type="text" width="25px" />
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import breakpoints from "src/js/swiper-breakpoints";

</script>

<style lang="scss" scoped>
.info-wrapper {
  padding: 5px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
</style>
