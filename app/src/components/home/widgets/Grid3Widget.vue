<template>
  <div :class="widgetClass">
    <WidgetTitle :title="widget.options.title" :widget-id="widget.id" v-if="widget.options.title"/>

    <div class="row widget-row q-col-gutter-sm">
      <div :class="get_class(c)" v-for="c in cols">
        <div class="row grid">
          <div class="col-8 q-pa-xs grid-item-1">
            <WidgetItem :type="widget.type" :widget="widget.options" :item="get_item(c, 0)" v-if="get_item(c, 0)"/>
          </div>
          <div class="col-4">
            <div class="q-pa-xs grid-item-2"><WidgetItem :type="widget.type" :widget="widget.options" :item="get_item(c, 1)" v-if="get_item(c, 1)"/></div>
            <div class="q-pa-xs grid-item-3"><WidgetItem :type="widget.type" :widget="widget.options" :item="get_item(c, 2)" v-if="get_item(c, 2)"/></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, toRef} from "vue";
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

const group = (array, n) =>
  new Array(Math.ceil(array.length / n))
    .fill(undefined)
    .map((el, i) => array.slice(i * n, (i + 1) * n));

const groupedItems = computed(() => group(widget.value.list, 3))
const cols = computed(() => Math.min(4, groupedItems.value.length))

function get_item(c, i) {
  return groupedItems.value[c - 1][i] ?? null
}

function get_class(c) {
  const cls = ['col widget-col ']

  switch (c) {
    case 1: break
    case 2: cls.push('gt-xs'); break
    case 3: cls.push('gt-sm'); break
    case 4: cls.push('gt-md'); break
  }

  return cls
}

</script>

<style lang="scss" scoped>
.bordered {
  .widget-col {
    .grid {
      border: 1px solid #e6e6e6;
    }

    .grid-item-1 {
      border-right: 1px solid #e6e6e6;
    }

    .grid-item-2 {
      border-bottom: 1px solid #e6e6e6;
    }
  }
}

</style>
