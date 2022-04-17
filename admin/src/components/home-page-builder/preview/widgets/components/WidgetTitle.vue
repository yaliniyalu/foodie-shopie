<template>
<div :class="rootClass">
  <div :class="textClass" :style="textStyle">{{ title.text }}</div>
  <q-btn :style="btnStyle" unelevated :label="title.btn.label" :to="to" v-if="title.btn.enable"/>
</div>
</template>

<script setup>
import {computed, toRef} from "vue";
import {parseColorStyle, parsePaddingClass, parseTextStyleClass} from "src/js/builder-utils";

const props = defineProps({
  title: { type: Object, required: true },
  widgetId: { type: String, required: true },
})

/** @type ToRef<IWidgetTitle> */
const title = toRef(props, 'title')

const align = {
  "center": 'justify-center',
  'left': "justify-between",
  "right": "justify-end"
}

const rootClass = computed(() => {
  return [
    'flex',
    'items-center',
    align[title.value.align],
    parsePaddingClass(title.value.padding)
  ];
})

const textStyle = computed(() => {
  return {
    fontSize: title.value.size + 'px',
    color: parseColorStyle(title.value.color),
  }
})

const textClass = computed(() => {
  return [...parseTextStyleClass(title.value.style), 'vs-text-' + title.value.align]
})

const btnStyle = computed(() => {
  return {
    color: parseColorStyle(title.value.btn.textColor),
    backgroundColor: parseColorStyle(title.value.btn.bgColor)
  }
})

const to = computed(() => {
  if (process.env.APP_TYPE === 'admin') return null

  return '/items?w=' + props.widgetId
})

</script>

<style lang="scss" scoped>

</style>
