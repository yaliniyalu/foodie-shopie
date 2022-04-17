<template>
  <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
    <q-list flat bordered>
      <q-item clickable v-ripple :to="'/customer/' + model.id">
        <q-item-section>
          <q-item-label>+91 {{model.phone}}</q-item-label>
          <q-item-label caption v-if="model.name">{{model.name}}</q-item-label>
        </q-item-section>
        <q-item-section side top v-if="model.customerType === 'Prime'">
          <q-item-label><BadgePrime/></q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </SafeComponent>
</template>

<script setup>
import {ref, watch} from "vue";
import {api} from "boot/axios";
import SafeComponent from "components/SafeComponent";
import BadgePrime from "components/badge/PrimeBadge";

const props = defineProps({
  id: {
    type: [String, Number],
    required: false
  },
  customer: {
    type: Object,
    default: null
  }
})

const model = ref()
const loading = ref(false)

watch(props, () => load(), {immediate: true})

async function load() {
  if (props.customer) {
    model.value = props.customer
    return
  }

  try {
    model.value = null
    loading.value = true
    const res = await api.get('/customer/' + props.id + "?select=id,name,phone,customer_type")
    model.value = res.data.data.customer
  } catch (e) {
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
