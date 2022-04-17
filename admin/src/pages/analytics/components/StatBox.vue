<template>
  <div class="stat-box">
    <div class="stat-title">{{ props.title }}</div>
    <div class="stat-value">
      <n-number-animation
        ref="animRef"
        :from="from"
        :to="to"
        :active="true"
        :precision="precision"
        :duration="2000"
      /></div>
  </div>
</template>

<script setup>
import { NNumberAnimation } from 'naive-ui'
import {ref, watch} from "vue";
import {isInt} from "src/js/utils";

const props = defineProps({
  title: String,
  value: [String, Number]
})

const from = ref()
const to = ref(0)
const precision = ref(0)
const animRef = ref()

watch(() => props.value, () => {
  from.value = to.value
  to.value = props.value

  if (isInt(props.value)) {
    precision.value = 0
  } else {
    precision.value = 2
  }
}, {immediate: true})
</script>

<style lang="scss" scoped>
.stat-box {
  width: 172px;
  padding: 10px;
  border: 1px solid #ffdc89;
  margin: 5px;
  border-radius: 5px;
}

.stat-title {
  text-transform: uppercase;
  color: var(--q-primary);
  font-weight: bold;
  font-size: 12px;
}

.stat-value {
  font-weight: bold;
  font-size: 22px;
  font-family: 'Roboto Mono', monospace;
  color: var(--q-secondary);
}
</style>
