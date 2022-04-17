<template>
  <q-dialog seamless position="top" ref="dialogRef">
    <q-card>
      <q-card-section class="flex justify-between items-center">
        <div class="text-h6">{{marker.orders[0].address.location.name}}</div>
        <q-btn dense flat round icon="close" v-close-popup/>
      </q-card-section>
      <q-separator/>

      <q-list bordered separator>
        <q-item clickable v-ripple v-for="order in  marker.orders" @click="openOrderUrl(order.id)">
          <q-item-section>
            <q-item-label class="text-bold">#{{order.id}}</q-item-label>
            <q-item-label>
              <div>{{ humanDateTime(order.created_at) }}&nbsp; <span class="text-grey">({{ timeAgo(order.created_at) }})</span></div>
            </q-item-label>
            <q-item-label>
              <StatusBadge :options="OrderStatus" :value="order.status"/>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent} from "quasar";
import {humanDateTime, timeAgo} from "src/js/utils";
import StatusBadge from "components/badge/StatusBadge";
import {OrderStatus} from "src/js/model-helpers/orders";
import {useRouter} from "vue-router";
const { dialogRef, onDialogOK } = useDialogPluginComponent()

const props = defineProps({
  marker: { type: Object, required: true }
})

const router = useRouter()

function openOrderUrl(id) {
  router.currentRoute.value.path === '/order'
    ? router.push('/order/' + id)
    : router.replace('/order/' + id)
}
</script>

<style lang="scss" scoped>

</style>
