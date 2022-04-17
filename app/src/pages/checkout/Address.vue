<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md">
      <p class="text-grey" v-if="savedAddress.length">Select from saved addresses</p>
      <q-list dense separator bordered>
        <q-item dense tag="label" v-for="a in savedAddress" :key="a.id">
          <q-item-section avatar>
            <q-radio v-model="selectedAddress" :val="a.id" color="secondary" />
          </q-item-section>
          <q-item-section class="saved-address-card">
            <div class="name">{{ a.name }}</div>
            <div class="address">
              <span>{{ a.street }}, </span>
              <span>{{ a.address1 }}, </span>
              <span v-if="a.landmark">{{ a.landmark }}, </span>
              <span>{{ a.address2 }}, </span>
              <span>{{ a.city }} - {{ a.pincode }}</span>
            </div>
            <div class="mobile">+91 {{ a.phone }}</div>
          </q-item-section>
        </q-item>
        <q-item dense tag="label">
          <q-item-section avatar>
            <q-radio v-model="selectedAddress" :val="false" color="secondary" />
          </q-item-section>
          <q-item-section>
            New Address
          </q-item-section>
        </q-item>
        <q-item dense tag="label">
          <q-item-section avatar>
            <q-radio v-model="selectedAddress" :val="-1" color="secondary" />
          </q-item-section>
          <q-item-section>
            Current Location
          </q-item-section>
        </q-item>
      </q-list>

      <q-separator/>

      <q-card flat>
        <q-form ref="formRef" @submit="saveAddress" @validation-error="validationError">
          <q-card-section class="q-gutter-sm q-pl-none q-pr-none">
            <q-input outlined stack-label label="Name" v-model="address.name" lazy-rules :rules="[ruleRequired]">
              <template v-slot:prepend><q-icon name="person"/></template>
            </q-input>

            <q-input outlined stack-label label="Mobile No" v-model="address.phone" lazy-rules :rules="[ruleRequired, ruleMobile]">
              <template v-slot:prepend><q-icon name="smartphone"/></template>
            </q-input>

            <q-input outlined stack-label label="Street Name" v-model="address.street" lazy-rules :rules="[ruleRequired]">
              <template v-slot:prepend><q-icon name="streetview"/></template>
            </q-input>

            <q-input outlined stack-label label="Address Line 1" v-model="address.address1" lazy-rules :rules="[ruleRequired]">
              <template v-slot:prepend><q-icon name="place"/></template>
            </q-input>

            <q-input outlined stack-label label="Address Line 2 (optional)" hint="" v-model="address.address2" lazy-rules>
              <template v-slot:prepend><q-icon name="place"/></template>
            </q-input>

            <q-input outlined stack-label label="Landmark (optional)" hint="" v-model="address.landmark" lazy-rules>
              <template v-slot:prepend><q-icon name="terrain"/></template>
            </q-input>

            <q-input outlined stack-label label="City" v-model="address.city" lazy-rules :rules="[ruleRequired]">
              <template v-slot:prepend><q-icon name="map"/></template>
            </q-input>

            <q-select outlined stack-label label="Locality" v-model="address.locationId" :options="filteredLocations" option-value="id" option-label="name" behavior="dialog" use-input lazy-rules map-options emit-value  @filter="filterFn" :rules="[ruleRequired]">
              <template v-slot:prepend><q-icon name="my_location"/></template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
<!--                    <q-item-label caption>{{ scope.opt.pincode }}</q-item-label>-->
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input outlined stack-label label="Pincode" v-model="address.pincode" lazy-rules :rules="[ruleRequired, rulePincode]" mask="######" unmasked-value>
              <template v-slot:prepend><q-icon name="my_location"/></template>
            </q-input>
          </q-card-section>

          <div class="text-center">
            <q-btn type="submit" unelevated label="Deliver Here" color="secondary"/>
          </div>
        </q-form>

        <q-inner-loading :showing="loading">
          <q-spinner-bars color="primary" size="50px" />
        </q-inner-loading>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {api} from "boot/axios";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import ui from "src/ui";
import {useNavbar} from "src/composables/navbar";

const store = useStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
/** @type Ref<Array<IAddress>> */
const savedAddress = ref([])
const selectedAddress = ref(false)
const formRef = ref()
const locations = ref([])
const filteredLocations = ref([])

const dialogMode = route.query.from === 'summary'

/** @type ComputedRef<IUser> */
const user = computed(() => store.state.app.user)
const emptyAddress = computed(() => ({
  id: null, name: user.value.name, phone: user.value.phone,
  street: '', address1: '', address2: '', landmark: '', city: '', pincode: '', locationId: null
}))
const address = ref({...emptyAddress.value})

useNavbar('back', "Delivery Address")

onMounted(() => {
  fetchAddresses()
  loadLocations()
})

watch(selectedAddress, async (val, prevVal) => {
  formRef.value.resetValidation()

  if (selectedAddress.value === false) {
    address.value = {...emptyAddress.value}
    return
  } else if (selectedAddress.value === -1) {
    address.value = {...emptyAddress.value}

    try {
      loading.value = true
      const data = await store.dispatch("app/getCurrentLocation")
      if (!data.address) {
        selectedAddress.value = prevVal
      } else {
        address.value = {...data.address, phone: user.value.phone, name: user.value.name}
      }
    } catch (e) {
      selectedAddress.value = prevVal
      ui.notifyError(e.message)
    } finally {
      loading.value = false
    }
    return
  }

  address.value = {...savedAddress.value.find(v => v.id === selectedAddress.value)}
})

async function loadLocations()
{
  try {
    const res = await api.get('settings/locations')
    locations.value = res.data.data
    filteredLocations.value = res.data.data
  } catch (e) {
    ui.notifyError("Unable to load locations")
  }
}

const isFormValid = computed(() => {
  if (!address.value.name || !address.value.phone || !address.value.street || !address.value.address1 || !address.value.city || !address.value.pincode) {
    return false
  }

  if (rulePincode(address.value.pincode) !== true) {
    return false
  }

  if (ruleMobile(address.value.phone) !== true) {
    return false
  }

  return true
})

async function fetchAddresses() {
  loading.value = true
  try {
    const res = await api.get('/address?limit=3&sortByDesc=updatedAt')
    savedAddress.value = res.data.data.address
  } catch (e) {
  } finally {
    loading.value = false
  }
}

function validationError() {
  nextTick().then(() => {
    document.activeElement.scrollIntoView({block: "center", inline: "nearest", behavior: "smooth"});
  })
}

async function saveAddress() {
  await store.dispatch("cart/setOrderDetails", {type: "deliveryAddress", value: address.value})

  if (dialogMode) {
    router.back()
  } else {
    await router.replace("/checkout/summary")
  }
}

function filterFn(val, update, abort) {
  update(() => {
    const needle = val.toLowerCase()
    filteredLocations.value = locations.value.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
  })
}

function ruleRequired(val) {
  return  !!val || 'Required'
}

function ruleMobile(val) {
  return /^\d{10}$/.test(val) || 'Invalid mobile no'
}

function rulePincode(val) {
  return /^\d{6}$/.test(val) || 'Invalid pincode'
}
</script>

<style lang="scss" scoped>
.saved-address-card {
  //padding-bottom: 0;

  .address {
    white-space: break-spaces;
    margin-bottom: 5px;
  }

  .name {
    font-weight: bold;
    margin-bottom: 5px;
    font-size: 16px;
  }

  .mobile {
    font-weight: bold;
  }
}
</style>
