<template>
  <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
    <q-list flat bordered>
      <q-item clickable v-ripple :to="'/item/' + model.id">
        <q-item-section avatar>
          <q-avatar>
            <img :src="model.images?.find(v => v.isDefault)?.image" alt="">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{model.name}}</q-item-label>
          <q-item-label caption>{{ model.category?.name }}</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption>{{ formatCurrency(model.price) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </SafeComponent>
</template>

<script setup>
import {ref, watch} from "vue";
import {api} from "boot/axios";
import SafeComponent from "components/SafeComponent";
import {formatCurrency} from "src/js/utils";

const props = defineProps({
  id: {
    type: [String, Number],
    required: false
  },
  item: {
    type: Object,
    default: null
  }
})

const model = ref()
const loading = ref(false)

watch(props, () => load(), {immediate: true})

async function load() {
  if (props.item) {
    model.value = props.item
    return
  }

  try {
    model.value = null
    loading.value = true
    const res = await api.get('/item/' + props.id + "?select=id,name,selling_price,category_id&include=image:item_id,image;category:id,name")
    model.value = res.data.data.item
  } catch (e) {
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
