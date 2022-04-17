<template>
  <DrawerComponent :title="!id ? 'Add Coupon' : model?.code">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-form @submit="save">
        <div class="q-mt-md">
          <q-input outlined stack-label label="Code" v-model="model.code" :debounce="650" :rules="[ruleRequired, v => v.length <= 10 || 'Max Length: 10', ruleCheckCode]" lazy-rules/>

          <q-select class="col" outlined stack-label label="Customer Type" clearable v-model="model.customerType" emit-value map-options
                    :options="CustomerTypes" hint=""
          />

          <q-input type="text" v-model="model.discountValue" outlined stack-label label="Discount" :rules="[ruleRequired, rulePositiveNumber]">
            <template v-slot:prepend>
              <q-btn color="accent" flat round :label="model.discountType === 'Percent' ? '%' : '₹'" @click="model.discountType = model.discountType === 'Percent' ? 'Amount' : 'Percent'"/>
            </template>
          </q-input>

          <q-input outlined stack-label label="Usage Limit" v-model="model.usageLimit" :rules="[rulePositiveInteger]"/>
          <q-input outlined stack-label label="Min. Order value" v-model="model.minOrderValue" :rules="[rulePositiveNumber]"/>
          <q-input outlined stack-label label="Max. Discount value" v-model="model.maxDiscountValue" :rules="[rulePositiveNumber]"/>

          <q-input outlined stack-label label="Expires On" v-model="model.expiresOn" mask="date" :rules="['date']">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="model.expiresOn">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="q-mt-lg text-center">
          <q-btn type="submit" color="secondary" unelevated label="Save" :loading="loading"/>
        </div>
      </q-form>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import {reactive, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import {ruleRequired, rulePositiveNumber, rulePositiveInteger} from 'src/js/validation-rules';
import SafeComponent from "components/SafeComponent";
import DrawerComponent from "components/DrawerComponent";
import {CustomerTypes} from "src/js/model-helpers/coupons";
import {useRouter} from "vue-router";

const props = defineProps({
  id: { type: [Number, String], default: null }
})
const emit = defineEmits(['save'])

const router = useRouter()

const loading = ref();
const defaultModel = {
  id: null,
  code: null,
  customerType: null,
  discountValue: null,
  discountType: "Percent",
  usageLimit: 0,
  minOrderValue: null,
  maxDiscountValue: null,
  expiresOn: null,
}
const model = reactive({...defaultModel})

watch(props, () => props.id ? load() : reset(), {immediate: true})

async function load() {
  try {
    reset()
    loading.value = true
    const res = await api.get('coupon/' + props.id)
    Object.assign(model, res.data.data.coupon)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

function reset() {
  Object.assign(model, defaultModel)
}

async function save() {
  if (props.id) {
    return update()
  }

  loading.value = true
  try {
    const res = await api.post('coupon', model)

    ui.notifySuccess("Coupon Saved")
    emit('update', res.data.data.coupon)

    router.replace(`/coupon/${res.data.data.coupon.id}`)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function update() {
  loading.value = true

  try {
    const res = await api.patch('coupon/' + props.id, model)

    ui.notifySuccess("Coupon Saved")
    emit('update', res.data.data.coupon)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function ruleCheckCode(val) {
  try {
    const res = await api.get(`coupon?select=id&filter[code]=${val}` + (props.id ? `&filter[id][eq][not]=${props.id}` : ''))
    if (!res.data.data.coupons.length) {
      return true
    }
    return "Code already exists"
  } catch (e) {
    return "Unexpected Error"
  }
}
</script>

<style lang="scss" scoped>

</style>
