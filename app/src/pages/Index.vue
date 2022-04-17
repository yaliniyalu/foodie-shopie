<template>
  <q-page v-if="dashboard">
    <Preview :widgets="dashboard"/>

    <q-page-sticky class="btn-whatsapp-container" position="bottom-right" :offset="[18, 18]" v-if="whatsapp">
      <q-btn fab icon="fab fa-whatsapp" class="btn-whatsapp" @click="openExternalLink(whatsapp.url)"/>
    </q-page-sticky>
  </q-page>
  <q-page v-else-if="!dashboard && loading">
    <HomeSkeleton/>
  </q-page>
</template>

<script setup>
import {useStore} from "vuex";
import {computed, onMounted, ref} from "vue";
import ui from "src/ui";
import HomeSkeleton from "components/skeleton/HomeSkeleton";
import NavBar from "components/NavBar";
import {openExternalLink} from "src/js/utils";
import Preview from "components/home/Preview";
import {useNavbar} from "src/composables/navbar";

const store = useStore()

useNavbar('logo auth search-bar')

/** @type ComputedRef<IDashboard> */
const dashboard = computed(() => store.getters["app/getDashboard"])
/** @type ComputedRef<IUser> */
const user = computed(() => store.state.app.user)
const loading = ref(false)

const whatsapp = null

onMounted(async () => {
  if (!dashboard.value) {
    try {
      loading.value = true
      await store.dispatch("app/loadDashboard")
    } catch (e) {
      ui.notifyError(e.message)
    } finally {
      loading.value = false
    }
  }
})

function getLayout(i) {
  return [0,1,0,0,1,0,1][i % 7] === 1 ? 'grid' : 'swiper';
}
</script>

<style lang="scss" scoped>
.title {
  color: $primary;
  text-transform: uppercase;
  font-weight: bold;
}

.btn-whatsapp {
  background: #52cd60;
  color: white;
}

.btn-whatsapp-container {
  z-index: 5;
}
</style>

