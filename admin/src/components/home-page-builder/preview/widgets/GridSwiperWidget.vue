<template>
<div :class="widgetClass">
  <WidgetTitle :title="widget.options.title" :widget-id="widget.id" v-if="widget.options.title"/>

  <div class="swiper">
    <swiper
      :space-between="5"
      :slides-per-view="1"
      :breakpoints="breakpoints"
      :modules="[Autoplay, Thumbs]"
      :autoplay="autoplay"
      :loop="widget.options.loop"
      :thumbs="{ swiper: thumbsSwiper }"
    >
      <swiper-slide v-for="i in widget.list">
        <WidgetItem :item="i" :widget="widget.options" :type="widget.type"/>
      </swiper-slide>

      <swiper @swiper="setThumbsSwiper" :loop="widget.options.loop" :spaceBetween="2" :slidesPerView="'auto'" :watchSlidesProgress="true" class="thumbs-swiper q-mt-sm">
        <swiper-slide v-for="i in widget.list">
          <img :src="getAssetsUrl(i.image || i.item?.image || i.category?.image)" alt="img" style="width: 100%"/>
        </swiper-slide>
      </swiper>
    </swiper>
  </div>
</div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Autoplay, Thumbs } from 'swiper';
import {computed, ref, toRef} from "vue";
import {getAssetsUrl} from "src/js/utils";
import {parsePaddingClass} from "src/js/builder-utils";
import WidgetTitle from "./components/WidgetTitle";
import WidgetItem from "./components/WidgetItem";

const props = defineProps({
  data: {type: Object, required: true}
})

/** @type ToRef<IWidget> */
const widget = toRef(props, 'data')

const widgetClass = computed(() => {
  return ['widget', ...parsePaddingClass(widget.value.options.padding), widget.value.options.bordered ? 'bordered' : '']
})

const autoplay = computed(() => widget.value.options.autoplay ? {disableOnInteraction: false} : false)

const thumbsSwiper = ref()

function setThumbsSwiper(swiper) {
  thumbsSwiper.value = swiper
}

const breakpoints = {
  "0": {
    slidesPerView: 1
  },
  "640": {
    slidesPerView: 2
  },
  "768": {
    slidesPerView: 4
  },
  "1024": {
    slidesPerView: 6
  }
}
</script>

<style lang="scss" scoped>
.thumbs-swiper {
  ::v-deep(.swiper-slide) {
    width: 50px;
    height: 50px;
    border: 1px solid transparent;
    padding: 2px;
  }

  ::v-deep(.swiper-slide-thumb-active) {
    border: 1px solid #e6e6e6;
  }
}

.bordered .swiper {
  border: 1px solid #ccc;
  padding: 8px;
}
</style>
