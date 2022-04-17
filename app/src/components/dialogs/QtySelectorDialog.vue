<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card style="width: 300px" class="q-px-sm">
      <q-card-section>
        <div class="text-h6">Qty</div>
      </q-card-section>

      <q-separator/>

      <q-list>
        <q-item dense tag="label" v-for="i in options" :key="i">
          <q-item-section avatar>
            <q-radio v-model="option" :val="i" color="secondary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{formatFraction(i)}}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="label">
          <q-item-section avatar>
            <q-radio v-model="option" :val="false" color="secondary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <q-input v-model="customQty" type="number" color="secondary" outlined dense
                       @focus="focusCustomQty" :rules="[validateCustomQty]"
              />
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-separator/>

      <q-card-actions>
        <q-btn color="secondary" unelevated class="full-width" label="Change" @click="changeQty"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import {computed, onMounted, ref, watch} from "vue";
import {isInt, isNumeric, formatFraction} from "src/js/utils";
import ui from "src/ui";
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

defineEmits([...useDialogPluginComponent.emits])
const props = defineProps({
  qty: {
    type: [Number, String],
    default: null
  },
  isInteger: {
    type: Boolean,
    default: true
  },
  max: {
    type: Number,
    default: null
  },
  min: {
    type: Number,
    default: null
  },
  increment: {
    type: Number,
    default: null
  }
})

const DEFAULT_VALUE = 4

const selectedQty = ref()
const customQty = ref()

const option = computed({
  get() {
    return !options.value.includes(selectedQty.value) || !selectedQty.value ? false : selectedQty.value
  },
  set(v) {
    if (v === false) {
      selectedQty.value = customQty.value
    } else {
      selectedQty.value = v
    }
  }
})

const options = computed(() => {
  if (props.isInteger) {
    return Array.from({length: DEFAULT_VALUE}, (x, i) => i + 1);
  }

  const inc = props.increment ?? 1;
  const min = props.min ?? inc;
  let val = null

  return Array.from({length: DEFAULT_VALUE}, (x, i) => {
    if (val === null) {
      val = min
      return min
    }

    val += inc;
    return val;
  });
})

onMounted(() => {
  selectedQty.value = props.qty;
  if (!options.value.includes(props.qty)) {
    customQty.value = props.qty
  }
})

watch(customQty, () => selectedQty.value = customQty.value)

function focusCustomQty() {
  selectedQty.value = customQty.value
}

function validateCustomQty(val) {
  if (!val || val <= 0) {
    return "Qty must be greater than 0"
  }

  if (!isNumeric(val)) {
    return "Qty must be a number"
  }

  if (props.isInteger) {
    if (!isInt(val)) {
      return "Qty must be number"
    }
  }

  if (props.max) {
    if (val > props.max) {
      return `Maximum allowed qty is ${props.max}`
    }
  }

  if (props.min) {
    if (val < props.min) {
      return `Minimum allowed qty is ${props.min}`
    }
  }

  if (props.increment) {
    if (val % props.increment !== 0) {
      return `Invalid qty. The qty must be multiples of ${props.increment}`
    }
  }

  return true
}

function changeQty() {
  const valid = validateCustomQty(selectedQty.value);

  if (valid === true) {
    dialogRef.value.hide()
    onDialogOK(selectedQty.value)
  } else {
    ui.notifyError(valid)
  }
}
</script>

<style lang="scss" scoped>

</style>
