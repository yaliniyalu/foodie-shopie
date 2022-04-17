<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="q-dialog-plugin">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Location</q-toolbar-title>
        <q-space />
        <q-btn flat round icon="close" v-close-popup/>
      </q-toolbar>

      <q-card-section>
        <p>Use pincode to check delivery info</p>
        <q-form @submit="change">
          <div class="row q-gutter-md">
            <q-input class="col-grow" dense outlined stack-label label="Pincode" mask="######" unmasked-value v-model="pincode" :rules="[v => !!v || 'Required', v => isPincode(v) || 'Invalid']"/>
            <div class="flex items-start">
              <q-btn type="submit" color="primary" unelevated label="Submit"/>
            </div>
          </div>
        </q-form>
        <div class="q-mt-md text-center">
          <q-btn flat color="primary" label="Use my current location" icon="location_on" @click="useCurrentLocation"/>
        </div>
      </q-card-section>

      <q-inner-loading :showing="loading">
        <q-spinner-radio color="primary" size="50px"/>
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent} from "quasar";
import {useStore} from "vuex";
import {computed, ref} from "vue";
import ui from "src/ui";
import {isPincode} from "src/js/utils";

const { dialogRef, onDialogHide } = useDialogPluginComponent()

defineEmits([...useDialogPluginComponent.emits])

const store = useStore()

/** @type ComputedRef<IDeliveryLocation>*/
const delivery = computed(() => store.state.cart.deliveryLocation)

const pincode = ref(delivery.value.location?.pincode)
const loading = ref(false)

async function change() {
  try {
    loading.value = true
    await store.dispatch("app/setCurrentLocation", {pincode: pincode.value, isTemp: false})
    dialogRef.value.hide()
  } catch (e) {
    ui.notifyError(e.message)
  } finally {
    loading.value = false
  }
}

async function useCurrentLocation() {
  try {
    loading.value = true
    const location = await store.dispatch("app/getCurrentLocation")
    await store.dispatch("app/setCurrentLocation", {pincode: location.address.pincode, isTemp: false})
    dialogRef.value.hide()
  } catch (e) {
    ui.notifyError(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
