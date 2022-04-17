<template>
  <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
    <q-list flat bordered>
      <q-item clickable v-ripple :to="'/account/' + model.id">
        <q-item-section avatar>
          <q-avatar>
            <img :src="model.image" alt="">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{model.name}}</q-item-label>
          <q-item-label caption>{{model.email}}</q-item-label>
          <q-item-label caption>{{model.phone}}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label><q-badge color="primary" :label="model.type"/></q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </SafeComponent>
</template>

<script setup>
import SafeComponent from "components/SafeComponent";
import {computed} from "vue";

const props = defineProps({
  account: Object
})

const model = computed(() => props.account)
const loading = false
</script>

<style lang="scss" scoped>

</style>
