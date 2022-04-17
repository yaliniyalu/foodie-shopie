<template>
  <DrawerComponent :title="model?.name">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-card flat>
        <q-card-section>
          <q-markup-table flat bordered separator="cell" class="text-left">
            <tbody>
            <tr>
              <td class="text-bold" style="width: 150px">Id</td>
              <td>{{ model.id }}</td>
            </tr>
            <tr>
              <td class="text-bold">Name</td>
              <td>{{ model.name }}</td>
            </tr>
            <tr>
              <td class="text-bold">Mobile</td>
              <td>{{ model.phone }}</td>
            </tr>
            <tr>
              <td class="text-bold">Email</td>
              <td>{{ model.email || '-' }}</td>
            </tr>
            <tr>
              <td class="text-bold">Type</td>
              <td>
                <q-btn-dropdown unelevated :model-value="false" :color="customerType.color" :label="customerType.name" :loading="updatingType">
                  <q-list>
                    <template v-for="status in CustomerTypes">
                      <q-item :class="'text-' + status.color" clickable v-close-popup @click="promptChangeCustomerType(status)" v-if="status.name !== customerType.name">
                        <q-item-section>
                          <q-item-label>{{ status.name }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-list>
                </q-btn-dropdown>
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>

        <q-card-section>
          <p class="text-bold">Statistics</p>
          <q-markup-table dense flat bordered separator="cell" class="text-center">
            <tbody>
            <tr class="text-bold">
              <td class="text-bold">Member Since</td>
              <td class="text-bold" style="width: 50%">Total Orders</td>
            </tr>
            <tr>
              <td>{{ humanDate(model.createdAt) }} ({{ timeAgo(model.createdAt) }})</td>
              <td>{{ model.statTotalOrders || '-' }}</td>
            </tr>
            <tr>
              <td class="text-bold">Amount Spend</td>
              <td class="text-bold">Order Frequency</td>
            </tr>
            <tr>
              <td>{{ model.statTotalOrderAmount.toFixed(2) || '-' }}</td>
              <td>{{ getOrderFrequency(model) || '-' }}</td>
            </tr>
            <tr>
              <td class="text-bold">Total Reviews</td>
              <td class="text-bold"></td>
            </tr>
            <tr>
              <td>{{ model.statTotalReviews || '-' }}</td>
              <td></td>
            </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>

        <q-card-section v-if="model.addresses?.length">
          <p class="text-bold">Saved Addresses</p>
          <q-list dense separator bordered>
            <q-item dense tag="label" v-for="a in model.addresses">
              <q-item-section class="address-card">
                <div class="name">{{ a.name }}</div>
                <div class="address">
                  <span>{{ a.street }}, </span>
                  <span>{{ a.address1 }}, </span>
                  <span v-if="a.landmark">{{ a.landmark }}, </span>
                  <span v-if="a.address2">{{ a.address2 }}, </span>
                  <span>{{ a.city }} - {{ a.pincode }}</span>
                </div>
                <div class="mobile">+91 {{ a.phone }}</div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator/>

        <q-card-section class="text-center">
          <q-btn color="negative" unelevated label="Disable" v-if="model.isActive" @click="promptStatusChange(false)" :loading="updatingStatus"/>
          <q-btn color="positive" unelevated label="Enable" v-else @click="promptStatusChange(true)" :loading="updatingStatus"/>
        </q-card-section>
      </q-card>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import SafeComponent from "components/SafeComponent";
import {api} from "boot/axios";
import ui from "src/ui";
import {ref, watch} from "vue";
import {useQuasar} from "quasar";
import {humanDate, timeAgo} from "src/js/utils";
import DrawerComponent from "components/DrawerComponent";
import {getOrderFrequency} from "src/js/model-helpers/customers";

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})
const emit = defineEmits(['update'])

const quasar = useQuasar()

const loading = ref();
const model = ref()

watch(props, () => load(), {immediate: true})

async function load() {
  try {
    loading.value = true
    const res = await api.get('/customer/' + props.id + `?include=address`)
    model.value = res.data.data.customer
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

const CustomerTypes = [
  { name: 'Normal', color: 'secondary', prompt: 'Do you want to demote member to Normal?', promptButton: 'Demote' },
  { name: 'Prime', color: 'primary', prompt: 'Do you want to promote member to Prime?', promptButton: 'Promote' },
]
const customerType = ref(CustomerTypes[0])
watch(model, () => customerType.value = CustomerTypes.find(v => v.name === model.value.customerType), {deep: true})

const updatingType = ref()
function promptChangeCustomerType(type) {
  if (type.name === model.value.customerType) {
    return
  }

  quasar.dialog({
    title: 'Confirm',
    message: type.prompt,
    persistent: true,
    ok: {
      unelevated: true,
      color: type.color,
      label: type.promptButton
    },
    cancel: {
      flat: true
    },
  }).onOk(() => {
    updateCustomerType(type.name)
  })
}

async function updateCustomerType(type) {
  try {
    updatingType.value = true
    const res = await api.patch('/customer/' + props.id, { customerType: type })
    await load()
    emit('update', model.value)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updatingType.value = false
  }
}

const updatingStatus = ref()
function promptStatusChange(status) {
  let prompt = "Do you want to <b class='text-postive'>enable</b> this user? The user can login and place orders."
  let btn = 'Enable'

  if (status === 0) {
    prompt = "Do you want to <b class='text-negative'>disable</b> this user? The user can not login or place orders any more."
    btn = 'Disable'
  }

  quasar.dialog({
    title: 'Warning',
    message: prompt,
    persistent: true,
    html: true,
    ok: {
      unelevated: true,
      color: 'negative',
      label: btn
    },
    cancel: {
      flat: true
    },
  }).onOk(() => {
    updateStatus(status)
  })
}

async function updateStatus(status) {
  try {
    updatingStatus.value = true
    const res = await api.patch('/customer/' + props.id, { isActive: status })
    await load()
    emit('update', model.value)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updatingStatus.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
