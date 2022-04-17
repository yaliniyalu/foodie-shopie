<template>
  <q-page class="q-gutter-md q-pa-md">
    <div>
      <div class="row q-col-gutter-md">
        <div class="col">
          <q-form @submit="saveBasicDetails">
            <q-card>
              <q-card-section class="flex text-h6">
                {{ models.basic.name }}
                <q-space/>
                <q-btn type="submit" flat round color="primary" icon="save" :loading="updating.basic" :disable="!changed.basic"/>
              </q-card-section>

              <q-separator/>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-md-4">
                    <q-input type="text" v-model="models.item.id" outlined readonly stack-label label="Id"/>
                  </div>
                  <div class="col-md-4">
                    <q-input type="text" v-model="models.item.code" outlined stack-label label="Code" lazy-rules readonly/>
                  </div>
                  <div class="col-md-4">
                    <q-input type="text" v-model="models.basic.name" outlined stack-label label="Name" :rules="[ruleRequired]"/>
                  </div>
                  <div class="col-md-4">
                    <SelectCategory v-model="models.basic._categoryId" emit-value outlined label="Category" stack-label :rules="[ruleRequired]" :filter="{isActive: true}"/>
                  </div>
                  <div class="col-md-4">
                    <q-input type="textarea" v-model="models.basic.shortDescription" outlined stack-label autogrow label="Short Description"  />
                  </div>
                  <div class="col-md-4">
                    <q-input type="textarea" v-model="models.basic.description" outlined stack-label autogrow label="Description"  />
                  </div>
                  <div class="col-md-4">
                    <q-input type="textarea" v-model="models.basic.specification" outlined stack-label autogrow label="Specification"  />
                  </div>
                </div>
              </q-card-section>

              <q-inner-loading :showing="updating.basic">
                <q-spinner-bars color="primary" size="50px"/>
              </q-inner-loading>
            </q-card>
          </q-form>
        </div>
        <div class="col-2 q-gutter-y-md">
          <q-card>
            <q-card-section>
              <ImagePreview :model-value="models.image" @update:model-value="updateDefaultImage" required :aspect-ratio="1" alt="image" :loading="updating.image"/>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section class="flex flex-center">
              <DropdownButton :options="ActiveStatus" :value="models.item.isActive" :change="saveStatus"/>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div>
      <div class="row q-col-gutter-md">
        <div class="col">
          <q-form @submit="saveUnitDetails">
            <q-card>
              <q-card-section class="flex items-center q-pt-xs q-pb-xs">
                <div class="text-bold">Unit</div><q-space/>
                <q-btn type="submit" flat round color="primary" icon="save" :loading="updating.unit" :disable="!changed.unit"/>
              </q-card-section>
              <q-separator/>
              <q-card-section>
                <div class="q-col-gutter-md row">
                  <div class="col-md-12">
                    <q-input type="text" v-model="models.unit.unit" outlined stack-label label="Unit" :rules="[ruleRequired]"/>
                  </div>
                  <div class="col-md-6">
                    <q-checkbox v-model="models.unit.isPack" outlined stack-label label="Is Pack" :true-value="true" :false-value="false"/>
                  </div>
                  <div class="col-md-6">
                    <q-input type="text" :model-value="models.unit.isPack ? 1 : models.unit.qtyPerSlice"
                             @update:model-value="v => models.unit.qtyPerSlice = v" outlined stack-label
                             label="Qty Per Slice" :rules="[ruleGtZero]" :readonly="!!models.unit.isPack"/>
                  </div>
                  <div class="col-md-6">
                    <q-input type="text" v-model="models.unit.minOrderQty" outlined stack-label label="Min Order Qty"
                             :rules="[ruleGtZero, models.unit.isPack ? rulePositiveInteger : rulePositiveNumber]"/>
                  </div>
                  <div class="col-md-6">
                    <q-input type="text" v-model="models.unit.maxOrderQty" outlined stack-label label="Max Order Qty"
                             :rules="[ruleGtZero, models.unit.isPack ? rulePositiveInteger : rulePositiveNumber]"
                    />
                  </div>
                </div>
              </q-card-section>
              <q-inner-loading :showing="updating.unit">
                <q-spinner-bars color="primary" size="50px"/>
              </q-inner-loading>
            </q-card>
          </q-form>
        </div>

        <div class="col">
          <q-form @submit="saveStockDetails">
            <q-card>
              <q-card-section class="flex items-center q-pt-xs q-pb-xs">
                <div class="text-bold">Stock</div><q-space/>
                <q-btn type="submit" flat round color="primary" icon="save" :loading="updating.stock" :disable="!changed.stock"/>
              </q-card-section>

              <q-separator/>

              <q-card-section>
                <div class="q-gutter-md">
                  <q-input v-model="models.stock.price" outlined stack-label label="Price"
                             :rules="[ruleRequired, ruleGtZero]"/>
                  <q-checkbox dense v-model="models.stock.maintainStock" outlined stack-label label="Maintain Stock" :false-value="false" :true-value="true"/>
                  <q-input v-model="models.stock.stock" outlined stack-label label="Qty"
                           :disable="!models.stock.maintainStock"
                           :rules="[models.stock.maintainStock ? ruleRequired : true, rulePositiveNumber]"/>
                  <q-toggle  v-model="models.stock.isAvailable" outlined stack-label label="Available" :true-value="true" :false-value="false"/>
                </div>
              </q-card-section>

              <q-inner-loading :showing="updating.stock">
                <q-spinner-bars color="primary" size="50px"/>
              </q-inner-loading>
            </q-card>
          </q-form>
        </div>

        <div class="col">
          <q-form @submit="saveDiscounts">
            <q-card>
              <q-card-section class="flex items-center q-pt-xs q-pb-xs">
                <div class="text-bold">Discounts</div><q-space/>
                <q-btn type="submit" flat round color="primary" icon="save" :loading="updating.discounts" :disable="!changed.discounts"/>
              </q-card-section>
              <q-separator/>
              <q-card-section>
                <div class="q-gutter-md">
                  <q-input type="text" v-model="discount.value" outlined stack-label
                           :label="discount.customer + ` (${discount.type})`"
                           :rules="[rulePositiveNumber]"

                           v-for="discount in models.discounts" :hint="'Price: ' + getDiscountAmount(discount)" >
                    <template v-slot:prepend>
                      <q-btn color="accent" flat round :label="discount.type === 'Percent' ? '%' : '₹'" @click="discount.type = discount.type === 'Percent' ? 'Amount' : 'Percent'"/>
                    </template>
                  </q-input>
                </div>
              </q-card-section>
              <q-inner-loading :showing="updating.discounts">
                <q-spinner-bars color="primary" size="50px"/>
              </q-inner-loading>
            </q-card>
          </q-form>
        </div>
      </div>
    </div>

    <q-card class="q-mt-md">
      <q-card-section class="text-bold">Images</q-card-section>
      <q-separator/>
      <q-card-section>
        <div class="flex q-gutter-md">
          <template v-for="(img, k) in models.images">
            <ImagePreview style="width: 150px; height: 150px" :model-value="models.images[k]" :aspect-ratio="1" alt="images" v-if="img" @update:model-value="v => updateImage(v, k)" :loading="!!updating.images[k]"/>
          </template>
          <ImagePreview  style="width: 150px; height: 150px" :model-value="tempImage" @update:model-value="updateTempImage" :aspect-ratio="1" alt="images" :loading="updating.tempImage"/>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog persistent v-model="addDialog">
      <q-card style="width: 60%">
        <q-form @submit="addNewItem">
          <q-card-section class="text-h6">
            New Item
          </q-card-section>
          <q-separator/>
          <q-card-section class="row q-col-gutter-md">
            <div class="col-md-6">
              <q-input type="text" v-model="addItem.code" debounce=600 outlined stack-label autofocus label="Code" :rules="[ruleRequired, ruleCheckItemCode]" lazy-rules/>
            </div>
            <div class="col-md-6">
              <q-input type="text" v-model="addItem.name" outlined stack-label label="Name" :rules="[ruleRequired]"/>
            </div>
            <div class="col-md-6">
              <SelectCategory v-model="addItem._categoryId" emit-value outlined label="Category" stack-label :rules="[ruleRequired]" :filter="{isActive: true}"/>
            </div>
            <div class="col-md-6">
              <q-input type="text" v-model="addItem.unit" outlined stack-label label="Unit" :rules="[ruleRequired]"/>
            </div>
            <div class="col-md-6">
              <q-checkbox v-model="addItem.isPack" outlined stack-label label="Is Pack" :true-value="true" :false-value="false"/>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-actions align="right">
            <q-btn color="primary" flat label="Cancel" @click="$router.back()"/>
            <q-btn type="submit" color="primary" unelevated label="Create" :loading="creating"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="loading">
      <q-spinner-bars color="primary" :size="50"/>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import {ruleRequired, rulePositiveNumber, ruleGtZero, rulePositiveInteger} from "src/js/validation-rules";
import {computed, nextTick, reactive, ref, watch} from "vue";
import SelectCategory from "components/select/SelectCategory";
import ImagePreview from "components/ImagePreview";
import {api} from "boot/axios";
import {getXPercentOfY} from "src/js/utils";
import { v4 as uuidv4 } from 'uuid';
import ui from "src/ui";
import {useRoute, useRouter} from "vue-router";
import DropdownButton from "components/DropdownButton";
import {ActiveStatus} from "src/js/model-helpers/items";
import {useFormEdited} from "src/composables/form-edited";
import SelectTimeSlot from "components/select/SelectTimeSlot";

const props = defineProps({
  id: {
    type: [String, Number],
    default: null
  }
})

const router = useRouter()
const route = useRoute()

const addDialog = ref(!props.id)
const addItem = ref({
  code: null,
  name: null,
  unit: null,
  isPack: true,
  _categoryId: null,
})
const creating = ref(false)
const loading = ref(false)

const updating = reactive({
  basic: false,
  stock: false,
  discount: false,
  images: {},
  image: false,
  tempImage: false,
  unit: false
})

const models = reactive({
  item: {
    id: null,
    code: null,
    isActive: true
  },
  basic: {
    name: null,
    shortDescription: null,
    description: null,
    specification: null,
    _categoryId: null,
  },
  unit: {
    unit: null,
    isPack: true,
    qtyPerSlice: 1,
    minOrderQty: 1,
    maxOrderQty: 0
  },
  stock: {
    maintainStock: false,
    stock: 0,
    isAvailable: true,
    price: 0,
  },
  discounts: {
    Normal: {type: 'Percent', value: 0, customer: 'Normal'},
    Prime: {type: 'Percent', value: 0, customer: 'Prime'}
  },
  images: {},
  image: null,
})

const changed = reactive({
  basic: false,
  stock: false,
  discounts: false,
  images: false,
  image: false,
  unit: false
})

const fields = {
  basic: ['name', '_categoryId', 'shortDescription', 'description', 'specification'],
  stock: ['maintainStock', 'stock', 'isAvailable', 'price'],
  unit: ['unit', 'isPack', 'qtyPerSlice', 'minOrderQty', 'maxOrderQty']
}

const tempImage = ref()
const groups = ref([])

watch(tempImage, () => {
  models.images[uuidv4()] = tempImage.value
  tempImage.value = null
})

watch(models.basic, _ => changed.basic = true, { deep: true })
watch(models.stock, _ => changed.stock = true, { deep: true })
watch(models.discounts, _ => changed.discounts = true, { deep: true })
watch(models.unit, _ => changed.unit = true, { deep: true })

watch(props, () => props.id && load())

const isFormDirty = computed(() => Object.values(changed).includes(true))

useFormEdited(isFormDirty)

async function updateDefaultImage(val) {
  try {
    updating.image = true
    await patchImage(val, models.image, true)
    models.image = val
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updating.image = false
  }
}

async function updateImage(val, k) {
  try {
    updating.images[k] = true
    await patchImage(val,  models.images[k], false)
    models.images[k] = val
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updating.images[k] = false
  }
}

async function updateTempImage(val) {
  try {
    updating.tempImage = true
    await patchImage(val, null, false)
    tempImage.value = val
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updating.tempImage = false
  }
}

if (props.id) {
  load()
}

async function load() {
  try {
    loading.value = true
    const fields = ['id', 'code', 'name', 'isAvailable', 'price', 'unit', 'isPack', 'shortDescription', '_categoryId',
      'maintainStock', 'stock', 'description', 'specification', '_categoryId', 'isActive', 'qtyPerSlice', 'minOrderQty', 'maxOrderQty']
    const res = await api.get('/item/' + props.id + `?select=${fields.join(',')}&include=category:id,name;images;discounts` )
    setModel(res.data.data.item)
  } catch (e) {
    console.log(e)
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

function setModel(data) {
  if (!changed.basic) {
    fields.basic.forEach(v => models.basic[v] = data[v])
    nextTick(() => changed.basic = false)
  }

  if (!changed.stock) {
    fields.stock.forEach(v => models.stock[v] = data[v])
    nextTick(() => changed.stock = false)
  }

  if (!changed.discounts) {
    data.discounts.forEach(v => models.discounts[v.customerType] = {type: v.discountType, value: v.discountValue, customer: v.customerType})
    nextTick(() => changed.discounts = false)
  }

  if (!changed.unit) {
    fields.unit.forEach(v => models.unit[v] = data[v])
    nextTick(() => changed.unit = false)
  }

  models.item.id = data.id
  models.item.code = data.code
  models.item.isActive = data.isActive

  models.image = data.images.find(v => v.isDefault)?.image
  models.images = data.images.filter(v => !v.isDefault).reduce((acc, v) => {acc[uuidv4()] = v.image; return acc}, {})
}

async function addNewItem() {
  try {
    creating.value = true
    const res = await api.post('/item', addItem.value)
    await router.replace('/item/' + res.data.data.item.id + '/edit')
    addDialog.value = false
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    creating.value = false
  }
}

async function saveBasicDetails() {
  try {
    updating.basic = true
    const res = await api.patch(`/item/${props.id}/basic`, models.basic)
    // setModel(res.data.data.item)
    changed.basic = false
    ui.notifySuccess("Basic details updated")
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updating.basic = false
  }
}

async function saveStockDetails() {
  try {
    updating.stock = true
    const res = await api.patch(`/item/${props.id}/stock`, models.stock)
    // setModel(res.data.data.item)
    changed.stock = false
    ui.notifySuccess("Stock details updated")
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updating.stock = false
  }
}

async function saveUnitDetails() {
  try {
    updating.unit = true
    const res = await api.patch(`/item/${props.id}/unit`, models.unit)
    // setModel(res.data.data.item)
    changed.unit = false
    ui.notifySuccess("Unit details updated")
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updating.unit = false
  }
}

async function saveDiscounts() {
  try {
    updating.discounts = true
    const res = await api.patch(`/item/${props.id}/discounts`, {discounts : Object.values(models.discounts)})
    // setModel(res.data.data.item)
    changed.discounts = false
    ui.notifySuccess("Discounts updated")
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updating.discounts = false
  }
}

async function saveStatus(s) {
  try {
    const res = await api.patch(`/item/${props.id}/status`, {isActive : s.value})
    models.item.isActive = s.value
    ui.notifySuccess("Status updated")
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
  }
}

async function patchImage(image, replace, isDefault) {
  return await api.patch(`/item/${props.id}/image`, {image, replace, isDefault})
}

async function ruleCheckItemCode(val) {
  try {
    const res = await api.get('item?select=id&filter[code]=' + val)
    if (!res.data.data.items.length) {
      return true
    }
    return "Code already exists"
  } catch (e) {
    return "Unexpected Error"
  }
}

function getDiscountAmount(discount) {
  let amount = '';
  if (discount.type === 'Percent') {
    amount =  getXPercentOfY(models.stock.price, discount.value)
  } else {
    amount = discount.value
  }

  return (models.stock.price ?? 0) - (isNaN(amount) ? 0 : amount)
}
</script>

<style lang="scss" scoped>

</style>
