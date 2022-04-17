<template>
  <div>
    <SwiperTitleLink label="Category" to="/category"/>
    <swiper class="q-mt-sm" :slides-per-view="3" :space-between="5" :breakpoints="breakpoints">
      <swiper-slide v-for="c in category">
        <CategoryCard :category="c"/>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import SwiperTitleLink from "components/SwiperTitleLink";
import breakpoints from "src/js/swiper-breakpoints";
import CategoryCard from "components/CategoryCard";

defineProps({
  category: { type: Array, required: true }
})
</script>

<style lang="scss" scoped>

</style>
