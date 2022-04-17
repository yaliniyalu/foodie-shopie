<template>
  <q-dialog persistent ref="dialogRef">
    <q-card style="width: 300px">
      <q-form @submit="addPayment">
        <q-card-section>
          <div class="text-h6">{{ type }} via {{ method }}</div>
        </q-card-section>

        <q-separator/>

        <q-card-section>
          <q-input outlined stack-label label="Amount" v-model="amount" :rules="[ruleRequired, ruleGtZero]"/>
        </q-card-section>

        <q-separator/>

        <q-card-actions align="right">
          <q-btn flat color="primary" label="Cancel" v-close-popup/>
          <q-btn type="submit" unelevated color="primary" label="Add Payment" :loading="loading"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent} from "quasar";
import {ref} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import {ruleRequired, ruleGtZero} from "src/js/validation-rules";

const { dialogRef, onDialogOK } = useDialogPluginComponent()

const props = defineProps({
  method: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  orderId: { type: Number, required: true }
})

const amount = ref(props.amount)
const loading = ref()

async function addPayment() {
  if (amount.value > props.amount) {
    ui.notifyError("Invalid amount")
    return
  }

  loading.value = true
  try {
    await api.patch('order/' + props.orderId + '/payment', {
      type: props.type === 'Pay' ? 'Credit' : 'Debit',
      amount: amount.value,
      method: props.method
    })
    dialogRef.value.hide()
    onDialogOK()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
