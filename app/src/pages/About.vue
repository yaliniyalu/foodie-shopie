<template>
  <q-page class="q-pa-md">
    <div class="flex flex-center q-mt-sm">
      <img :src="app.logo" alt="logo" style="width: 100%"/>

      <p class="text-grey">version 1.0</p>
    </div>
    <q-separator/>

    <q-list class="q-mt-md" bordered separator>
      <q-item clickable v-ripple @click="openPage('privacy')">
        <q-item-section>Privacy Policy</q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="openPage('terms')">
        <q-item-section>Terms and Conditions</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import {computed} from "vue";
import {useStore} from "vuex";
import {useNavbar} from "src/composables/navbar";

const store = useStore()

/** @type ComputedRef<IApp> */
const app = computed(() => store.state.app.app)

useNavbar('back search cart auth', "About")

function openPage(page) {
  store.dispatch("app/openPage", { page })
}
</script>

<style lang="scss" scoped>

</style>
