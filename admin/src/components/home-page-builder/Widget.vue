<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <q-input outlined stack-label class="col-4" v-model="model.name" label="Name"/>
      <q-input outlined stack-label class="col-4" v-model="model.template" label="Template" readonly/>
      <q-input outlined stack-label class="col-4" v-model="model.type" label="Type" readonly/>

      <div class="col-4">
        <q-card flat bordered>
          <q-card-section>
            <p class="text-bold q-ma-none">Customers</p>
          </q-card-section>
          <q-separator/>
          <div class="flex column">
            <q-checkbox v-model="model.options.customers" :val="opt.value" :label="opt.label" v-for="opt in CustomerOpts"/>
          </div>
        </q-card>
      </div>

      <div class="col-4">
        <q-card flat bordered>
          <q-card-section>
            <p class="text-bold q-ma-none">Customers</p>
          </q-card-section>
          <q-separator/>
          <div class="flex column">
            <q-checkbox v-model="model.options.screenSizes" :val="opt.value" :label="opt.label" v-for="opt in ScreenOpts"/>
          </div>
        </q-card>
      </div>

      <div class="col-4">
        <q-checkbox v-model="model.options.bordered" val="true" label="Bordered"/>
        <q-separator/>

        <div class="flex flex-center column q-pa-md">
          <q-btn unelevated color="primary" label="Padding" @click="paddingDialog = true"/>
          <span class="q-mt-md">{{ model.options.padding.join(', ')}}</span>
        </div>
        <q-separator/>

        <div class="flex flex-center justify-between q-gutter-md">
          <q-toggle v-model="model.is_active" label="Show"/>
          <q-btn unelevated label="Delete" color="negative" @click="deleteWidget"/>
        </div>
      </div>
    </div>

    <q-dialog v-model="paddingDialog">
      <BlockPadding v-model="model.options.padding" style="width: 50%"/>
    </q-dialog>

    <q-separator class="q-mt-md q-mb-md"/>

    <div class="row" v-if="model.template === 'swiper'">
      <div class="col-8">
        <q-card flat bordered>
          <q-card-section>
            <p class="text-bold q-ma-none">Grids</p>
          </q-card-section>
          <q-separator/>
          <div class="row text-center">
            <template v-for="opt in BreakPointOpts">
              <div class="col">
                <div class="text-bold">{{ opt.label }}</div>
                <div class="flex column">
                  <q-input outlined stack-label dense type="number" v-model="model.options.breakpoints[opt.value].slidesPerView" label="Display Count"/>
                </div>
              </div>
              <q-separator vertical/>
            </template>
          </div>
        </q-card>
      </div>
      <div class="col-4">
        <q-card flat bordered>
          <q-card-section>
            <p class="text-bold q-ma-none">Options</p>
          </q-card-section>
          <q-separator/>
          <div class="flex column">
            <q-checkbox v-model="model.options.pagination" :val="true" label="Pagination"/>
            <q-checkbox v-model="model.options.autoplay" :val="true" label="Autoplay"/>
            <q-checkbox v-model="model.options.loop" :val="true" label="Loop"/>
          </div>
        </q-card>
      </div>
    </div>

    <div class="row" v-if="model.template === 'grid'">
      <div class="col">
        <q-card flat bordered>
          <q-card-section>
            <p class="text-bold q-ma-none">Grids</p>
          </q-card-section>
          <q-separator/>
          <div class="row text-center">
            <template v-for="opt in BreakPointOpts">
              <div class="col">
                <div class="text-bold">{{ opt.label }}</div>
                <div class="flex column">
                  <q-input outlined stack-label dense type="number" v-model="model.options.grid[opt.value].rows" label="Rows"/>
                  <q-input outlined stack-label dense type="number" v-model="model.options.grid[opt.value].cols" label="Cols"/>
                </div>
              </div>
              <q-separator vertical/>
            </template>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, toRef, watch} from "vue";
import BlockPadding from "components/home-page-builder/blocks/BlockPadding";
import {ScreenSizes} from "src/js/builder-utils";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'delete'])

/** @type {ToRef<IWidget>} */
const model = toRef(props, 'modelValue')
const paddingDialog = ref()

const CustomerOpts = [
  {label: 'Normal', value: 'normal'},
  {label: 'Prime', value: 'prime'},
  {label: 'Non Members', value: 'non-members'},
]

const ScreenOpts = [
  {label: 'Mobile', value: ScreenSizes.xs},
  {label: 'Mobile (large)', value: ScreenSizes.sm},
  {label: 'Tablet', value: ScreenSizes.md},
  {label: 'Tablet (large)', value: ScreenSizes.lg}
]

const BreakPointOpts = [
  {label: 'Mobile', value: "0"},
  {label: 'Mobile Large', value: "640"},
  {label: 'Tablet', value: "768"},
  {label: 'Tablet Large', value: "1024"}
]

function deleteWidget() {
  emit('delete', model.value)
}
</script>

<style scoped>

</style>
