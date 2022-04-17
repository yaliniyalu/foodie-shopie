<template>
  <q-card>
    <q-card-section class="flex text-h6">
      Payment
      <q-space/>
      <q-btn type="submit" flat round color="primary" icon="save" :loading="loading" :disable="!changed" @click="onSave"/>
    </q-card-section>

    <q-separator/>

    <q-card-section class="q-gutter-md">
      <div class="text-bold">RazorPay Payment Page</div>
      <div class="row">
        <div class="col q-gutter-md">
          <q-input outlined stack-label label="Name" v-model="model['razorpay.payment.name']"/>
          <q-input outlined stack-label label="Color" v-model="model['razorpay.payment.color']">
            <template v-slot:prepend>
              <q-icon name="radio_button_checked" :style="{color: model['razorpay.payment.color']}"/>
            </template>
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color v-model="model['razorpay.payment.color']" default-view="palette" format-model="hex"/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="q-ml-md" style="width: 128px">
          <ImagePreview v-model="model['razorpay.payment.logo']" size="128x128" alt="256x256" style="width: 128px"/>
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <div class="text-bold">Refund</div>
      <div class="row q-col-gutter-md">
        <div class="col">
          <q-input type="text" v-model="model['payment.refund.fee.min']" outlined stack-label :label="`Fee (${model['payment.refund.fee.type']})`" :rules="[rulePositiveNumber]">
            <template v-slot:prepend>
              <q-btn color="accent" flat round :label="model['payment.refund.fee.type'] === 'Percent' ? '%' : '₹'"
                     @click="model['payment.refund.fee.type'] = model['payment.refund.fee.type'] === 'Percent' ? 'Amount' : 'Percent'"/>
            </template>
          </q-input>
        </div>
        <div class="col">
          <q-input outlined stack-label label="Max Fee (in amount)" v-model="model['payment.refund.fee.max']" v-if="model['payment.refund.fee.type'] === 'Percent'"/>
        </div>
      </div>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-bars color="primary" size="50px"/>
    </q-inner-loading>
  </q-card>
</template>

<script setup>

import {nextTick, reactive, ref, watch} from "vue";
import {useFormEdited} from "src/composables/form-edited";
import ImagePreview from "components/ImagePreview";
import {rulePositiveNumber} from "src/js/validation-rules";
import {api} from "boot/axios";
import ui from "src/ui";

const loading = ref(false)
const changed = ref(false)

const model = reactive({
  'razorpay.payment.name': '',
  'razorpay.payment.color': '',
  'razorpay.payment.logo': '',

  'payment.refund.fee.max': '',
  'payment.refund.fee.min': '',
  'payment.refund.fee.type': 'Percent',
})

useFormEdited(changed)

watch(model, _ => changed.value = true, { deep: true })


async function onSave() {
  try {
    loading.value = true
    await api.put('/app-setting', Object.keys(model).map(v => ({id: v, value: model[v]})))
    changed.value = false
    ui.notifySuccess('Updated')
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

async function onLoad() {
  try {
    loading.value = true
    const res = await api.get('/app-setting?filter[id][in]=' + Object.keys(model).join(','))
    Object.assign(model, res.data.data)
    await nextTick(() => changed.value = false)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

onLoad()
</script>

<style lang="scss" scoped>

</style>
