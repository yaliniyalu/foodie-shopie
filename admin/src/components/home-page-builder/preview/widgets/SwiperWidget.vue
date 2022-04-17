<template>
  <div :class="widgetClass">
    <WidgetTitle :title="widget.options.title" :widget-id="widget.id" v-if="widget.options.title"/>
    <swiper
      class="q-mt-sm"
      :breakpoints="widget.options.breakpoints"
      :modules="[Pagination, Autoplay]"
      :pagination="pagination"
      :autoplay="autoplay"
      :loop="widget.options.loop"

      v-if="swiperRefresh"
    >
      <swiper-slide v-for="i in widget.list">
        <WidgetItem :item="i" :widget="widget.options" :type="widget.type"/>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Autoplay } from 'swiper';
import {computed, nextTick, ref, toRef, watch} from "vue";
import WidgetItem from "./components/WidgetItem";
import WidgetTitle from "./components/WidgetTitle";
import {parsePaddingClass} from "src/js/builder-utils";

const props = defineProps({
  data: { type: Object, required: true },
})

/** @type ToRef<IWidget>*/
const widget = toRef(props, 'data')
const swiperRefresh = ref(true)

if (process.env.APP_TYPE === 'admin') {
  let swiperOpts = {
    breakpoints: widget.value.options.breakpoints,
    loop: widget.value.options.loop,
    autoplay: widget.value.options.autoplay
  }

  function deepEqual(x, y) {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
      ok(x).length === ok(y).length &&
      ok(x).every(key => deepEqual(x[key], y[key]))
    ) : (x === y);
  }

  watch(() => widget.value.options, () => {
    const swOpts = {
      breakpoints: widget.value.options.breakpoints,
      loop: widget.value.options.loop,
      autoplay: widget.value.options.autoplay
    }

    if (deepEqual(swiperOpts, swOpts)) {
      return
    }

    swiperOpts = swOpts
    swiperRefresh.value = false
    nextTick(() => swiperRefresh.value = true)
  }, {deep: true})
}

const pagination = computed(() => widget.value.options.pagination ? { clickable: true } : false)
const autoplay = computed(() => widget.value.options.autoplay ? {disableOnInteraction: false} : false)

const widgetClass = computed(() => parsePaddingClass(widget.value.options.padding))
</script>

<style lang="scss" scoped>

</style>
