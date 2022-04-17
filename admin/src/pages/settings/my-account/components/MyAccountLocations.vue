<template>
<div>
  <q-card>
    <q-card-section>
      <div class="text-bold" v-if="locations.length">Locations</div>
      <div class="text-grey text-center" v-else-if="loading">Loading locations...</div>
      <div class="text-grey text-center" v-else-if="!locations.length">No locations allocated!</div>

      <q-list bordered separator v-if="locations.length">
        <q-item clickable v-ripple v-for="l in locations">
          <q-item-section>
            <q-item-label>{{l.location.name}}</q-item-label>
            <q-item-label caption>{{l.location.pincode}}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="font-mono">{{l.location.commission}}</q-item-label>
            <q-item-label caption>Commission</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</div>
</template>

<script setup>
import {api} from "boot/axios";
import ui from "src/ui";
import {onMounted, ref} from "vue";
import {useStore} from "vuex";

const store = useStore()

const loading = ref()
const locations = ref([])

onMounted(() => loadLocations())

async function loadLocations() {
  try {
    loading.value = true
    const res = await api.get(`/location/allocation?filter[admin_id]=${store.state.app.user.id}&include=location`)
    locations.value = res.data.data.location_allocations
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
