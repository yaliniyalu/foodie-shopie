<template>
  <q-card :bordered="bordered" :flat="flat">
    <q-card-section v-if="delivery.location">
      <div class="row">
        <div class="col flex items-center">Deliver to &nbsp;<b><span v-if="delivery.location.name">{{ delivery.location.name }} - </span>{{ delivery.location.pincode }}</b></div>
        <div class="col-auto"><q-btn color="primary" outline label="Change" @click="changeDialog"/></div>
      </div>
      <p class="text-negative text-center q-ma-none q-mt-md" v-if="!delivery.isDeliverable">Your order cannot be delivered to <b>{{ delivery.location.name }} - {{ delivery.location.pincode }}</b></p>
    </q-card-section>
    <q-card-section v-else>
      <div class="row">
        <div class="col">Enter your pincode to check delivery status</div>
        <div class="col-auto"><q-btn color="primary" outline label="Change" @click="changeDialog"/></div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import {computed} from "vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import GetLocationDialog from "components/dialogs/GetLocationDialog";

const store = useStore()
const quasar = useQuasar()

defineProps({
  bordered: Boolean,
  flat: Boolean
})

/** @type ComputedRef<IDeliveryLocation>*/
const delivery = computed(() => store.state.cart.deliveryLocation)

function changeDialog() {
  quasar.dialog({
    component: GetLocationDialog
  })
}
</script>

<style lang="scss" scoped>

</style>
