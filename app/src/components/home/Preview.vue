<template>
  <template v-for="widget in widgets" :key="widget.id">
    <SwiperWidget :data="widget" v-if="widget.template === 'swiper' && isWidgetVisible(widget)"/>

    <GridWidget :data="widget" v-if="widget.template === 'grid' && isWidgetVisible(widget)"/>

    <Grid3Widget :data="widget" v-if="widget.template === 'grid-3' && isWidgetVisible(widget)"/>

    <ActionButtons :data="widget" v-if="widget.template === 'actions' && isWidgetVisible(widget)"/>

    <GridSwiperWidget :data="widget" v-if="widget.template === 'grid-swiper' && isWidgetVisible(widget)"/>
  </template>
</template>

<script setup>
import SwiperWidget from "./widgets/SwiperWidget";
import GridWidget from "./widgets/GridWidget";
import Grid3Widget from "./widgets/Grid3Widget";
import GridSwiperWidget from "./widgets/GridSwiperWidget";
import ActionButtons from "./widgets/ActionButtons";
import {ScreenSizes} from "src/js/builder-utils";
import {ref} from "vue";
import {useStore} from "vuex";

const props = defineProps({
  widgets: {
    type: Array,
    required: true
  }
})

const width = window.innerWidth;
const screenSize = ScreenSizes.getValues().reverse().find(v => width > v)

const store = useStore()

const customerType = ref()

if (process.env.APP_TYPE === 'admin') {
  customerType.value = 'non-members'
} else {
  if (!store.state.app.user) {
    customerType.value = 'non-members'
  } else {
    customerType.value = store.state.app.user?.isPrime ? 'prime' : 'normal';
  }
}

/**
 * @param {IWidget} widget
 */
function isWidgetVisible(widget) {
  if (
    widget.is_active &&
    widget.options.screenSizes.includes(screenSize) &&
    widget.options.customers.includes(customerType.value) &&
    (widget.list.length || widget.template === 'actions')
  ) return true
  else return false
}
</script>

<style lang="scss" scoped>

</style>
