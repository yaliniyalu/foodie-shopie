<template>
  <q-btn-dropdown unelevated :model-value="false" :color="option.color" :label="option.label" :loading="loading">
    <q-list>
      <template v-for="opt in options">
        <q-item :class="'text-' + opt.color" clickable v-close-popup @click="changeOption(opt)" v-if="opt.value !== option.value">
          <q-item-section>
            <q-item-label>{{ opt.value !== option.value ? (opt.action || opt.label) : opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import {ref, watch} from "vue";
import {useQuasar} from "quasar";

const props = defineProps({
  options: {
    type: Object,
    required: true
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  change: {
    type: Function,
    required: true
  }
})

const option = ref()
const loading = ref()

const quasar = useQuasar()

watch(props, () => {
  option.value = props.options.find(o => o.value === props.value)
}, {immediate: true})

async function changeOption(opt) {
  loading.value = true
  try {
    await props.change(opt)
  } catch (e) {
  }
  loading.value = false
}
</script>

<style lang="scss" scoped>

</style>
