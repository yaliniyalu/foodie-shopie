<template>
  <div :class="widgetClass">
    <WidgetTitle :title="widget.options.title" :widget-id="widget.id" v-if="widget.options.title"/>

    <div class="row widget-row" v-for="r in rc.rows">
      <div class="col widget-col q-pa-sm" v-for="c in rc.cols">
        <WidgetItem :item="widget.list[row_index(r, c)]" :widget="widget.options" :type="widget.type" v-if="widget.list[row_index(r, c)]"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, toRef, watch} from "vue";
import {parsePaddingClass} from "src/js/builder-utils";
import WidgetItem from "./components/WidgetItem";
import WidgetTitle from "./components/WidgetTitle";

const props = defineProps({
  data: {type: Object, required: true}
})

/** @type ToRef<IWidget> */
const widget = toRef(props, 'data')

const widgetClass = computed(() => {
  return ['widget', ...parsePaddingClass(widget.value.options.padding), widget.value.options.bordered ? 'bordered' : '']
})

const grid = ref()

watch(widget, () => grid.value = widget.value.options.grid, {deep: true, immediate: true})

const width = window.innerWidth;

const rc = computed(() => {
  let i = Object.keys(grid.value).sort((a, b) => a - b).reverse().find(v => width > v)
  if (!i) {
    i = Object.keys(grid.value)[0]
  }

  return {
    rows: parseInt(grid.value[i]['rows']),
    cols: parseInt(grid.value[i]['cols'])
  }
})

const row_index = (r, c) => rc.value.cols * (r - 1) + (c - 1)
</script>

<style lang="scss" scoped>

.widget.bordered {
  .widget-col {
    border-bottom: 1px solid #e6e6e6;
    border-right: 1px solid #e6e6e6;
  }

  .widget-row {
    border-left: 1px solid #e6e6e6;
    border-top: 1px solid #e6e6e6;
  }
}
</style>
