<template>
  <div class="flex flex-center full-width">
    <q-btn-group unelevated spread class="full-width" v-if="internalCounter">
      <q-btn unelevated color="primary" label="-" @click.stop="decreaseQty"/>
      <q-btn flat color="primary" :label="internalCounter" />
      <q-btn unelevated color="primary" label="+" @click.stop="increaseQty"/>
    </q-btn-group>
    <q-btn unelevated color="primary" label="Add to Cart" class="full-width" v-else @click.stop="increaseQty"/>
  </div>
</template>

<script setup>
import {useStore} from "vuex";
import {debounce} from "quasar";
import {ref, watch, watchEffect} from "vue";
import ui from "src/ui";

const props = defineProps({
  item: { type: Object, required: true },
  modelValue: { type: [Number, String] }
})

const emit = defineEmits(['update:modelValue'])

const store = useStore()
const loading = ref(false)

const internalCounter = ref(0)

watchEffect(() => internalCounter.value = props.modelValue)

async function decreaseQty() {
  try {
    await store.dispatch("app/doAuthenticated")
  } catch (e) {
    return
  }

  if (internalCounter.value < 0) {
    internalCounter.value = 0;
  }

  internalCounter.value --
  emit('update:modelValue', internalCounter.value)
  update()
}

async function increaseQty() {
  try {
    await store.dispatch("app/doAuthenticated")
  } catch (e) {
    return
  }
  internalCounter.value ++
  emit('update:modelValue', internalCounter.value)
  update()
}

async function updateCartQty() {
  loading.value = true
  try {
    await store.dispatch("cart/addItem", {item: props.item, qty: internalCounter.value, isUpdate: true })
  } catch(e) {
    console.log(e)
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

const update = debounce(updateCartQty, 650, false)

</script>

<style lang="scss" scoped>

</style>
