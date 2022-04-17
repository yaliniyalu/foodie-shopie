<template>
  <q-skeleton type="rect" height="100px" />
  <div class="q-pa-sm q-mt-md">
    <div>
      <div class="flex justify-between">
        <q-skeleton type="rect" height="25px" width="50%" />
        <q-skeleton type="rect" height="25px" width="25px" />
      </div>
      <swiper class="q-mt-sm" :slides-per-view="3" :space-between="5" :breakpoints="breakpoints">
        <swiper-slide v-for="i in 10">
          <q-skeleton type="rect" height="120px" />
        </swiper-slide>
      </swiper>
    </div>

    <ItemSwiperSkeleton class="q-mt-lg"/>

    <div class="q-mt-lg item-grid">
      <div class="flex justify-between title">
        <q-skeleton type="rect" height="25px" width="50%" />
        <q-skeleton type="rect" height="25px" width="25px" />
      </div>
      <div class="row">
        <div class="col-xs-6 col-sm-6 col-md-4 col-lg-4 item" v-for="i in 4">
          <q-skeleton type="rect" height="120px"  />
          <div class="info-wrapper">
            <q-skeleton type="text" width="90%" />
            <div class="flex q-gutter-md">
              <q-skeleton type="text" width="25px" />
              <q-skeleton type="text" width="25px" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <ItemSwiperSkeleton class="q-mt-lg"/>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import breakpoints from "src/js/swiper-breakpoints";
import ItemSwiperSkeleton from "components/skeleton/ItemSwiperSkeleton";

</script>

<style lang="scss" scoped>
.item-grid {
  border-left: 1px solid #e6e6e6;
  border-top: 1px solid #e6e6e6;

  .title {
    padding: 2px;
    border-right: 1px solid #e6e6e6;
    border-bottom: 1px solid #e6e6e6;
  }

  .row {
    border-radius: 10px;
  }

  .item {
    padding: 5px;
    border-bottom: 1px solid #e6e6e6;
    border-right: 1px solid #e6e6e6;
  }
}

.info-wrapper {
  padding: 5px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
</style>
