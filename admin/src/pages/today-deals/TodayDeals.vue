<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Items</div>
          </div>

          <div class="col-auto">
            <SelectItem ouulined stack-label emit-value map-options behavior="dialog" multiple v-model="selectedItems" @remove="removeItem" @add="addItem" input-class="input-class-is" popup-content-class="popup-class-is"/>
          </div>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <q-table
          separator="horizontal"
          flat
          bordered
          :columns="columns"
          row-key="id"
          color="primary"

          binary-state-sort

          ref="tableRef"
          :rows="rows"
          :loading="loading"
          :visible-columns="visibleColumns"
          v-model:pagination="pagination"
          @request="onQTableRequest"

          @row-click="onRowClick"

          :rows-per-page-options="[0]"
        >
          <template v-slot:body-cell-maintain_stock="props">
            <q-td key="maintain_stock" :props="props">
              <q-badge color="teal"   label="Yes" v-if="props.value"/>
              <q-badge color="purple" label="No"  v-else/>
            </q-td>
          </template>

          <template v-slot:body-cell-stock="props">
            <q-td key="stock" :props="props">
              <span v-if="props['row']['maintainStock']" :class="props.value <= 10 ? 'text-red' : ''">{{ props.value }}</span>
              <span v-else>-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-buying_price="props">
            <q-td key="buying_price" :props="props" class="acc-number">{{ props.value }}</q-td>
          </template>

          <template v-slot:body-cell-selling_price="props">
            <q-td key="selling_price" :props="props" class="acc-number">{{ props.value }}</q-td>
          </template>

          <template v-slot:body-cell-is_available="props">
            <q-td key="is_available" :props="props">
              <q-badge color="green" label="Yes" v-if="props.value"/>
              <q-badge color="red"   label="No"  v-else/>
            </q-td>
          </template>

          <template v-slot:body-cell-is_active="props">
            <q-td key="is_active" :props="props">
              <q-badge color="green" label="Active"    v-if="props.value"/>
              <q-badge color="red"   label="Inactive"  v-else/>
            </q-td>
          </template>

          <template v-slot:body-cell-rating="props">
            <q-td key="rating" :props="props">

            </q-td>
          </template>

          <template v-slot:body-cell-image="props">
            <q-td key="image" :props="props" class="flex flex-center">
              <img alt="img" :src="props.value" v-if="props.value" style="height: 28px;">
            </q-td>
          </template>

          <template v-slot:top>
            <div/>

            <q-space />

            <DropdownSelectMultiple dense flat icon="view_column" :options="columns" v-model="visibleColumns" option-value="name"/>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <NavigationDrawer path="/today-deals/:id" @update="trigger"/>
  </q-page>
</template>

<script setup>
import ui from "src/ui";
import {useQuasar} from "quasar";
import {useDataTable} from "src/composables/data-table";
import {Columns} from "src/js/model-helpers/today-deals";
import NavigationDrawer from "components/drawers/NavigationDrawer";
import {useRouter} from "vue-router";
import SelectItem from "components/select/SelectItem";
import {ref, watch} from "vue";
import {api} from "boot/axios";
import DropdownSelectMultiple from "components/DropdownSelectMultiple";

const router = useRouter()
const quasar = useQuasar()

const {
  visibleColumns,
  columns,
  pagination,
  filter,
  rows,
  tableRef,
  trigger,
  loading,
  onQTableRequest,
  onError,
  withFilterBuilder,
  withResponseParser,
  withOptions
} = useDataTable(Columns)

pagination.value.rowsPerPage = 0
pagination.value.sortBy = null

onError(() => ui.notifyUnexpectedError())


withResponseParser((data) => [data.data.todayDeals, data.data.totalCount])

withOptions({
  url: 'today-deals',
  storageKey: 'today-deals-list'
})

function onRowClick(evt, row, index) {
  router.currentRoute.value.path === '/today-deals'
    ? router.push('/today-deals/' + row.item[0].id)
    : router.replace('/today-deals/' + row.item[0].id)
}

const selectedItems = ref([])

watch(() => rows, () => {
  selectedItems.value = rows.value.map(v => v.item[0].id)
}, { deep: true })

async function removeItem({value}) {
  try {
    await api.delete('today-deals/' + value)
    trigger()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
  }
}

async function addItem({value}) {
  try {
    await api.post('today-deals', {item: value})
    trigger()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
  }
}
</script>

<style lang="scss" scoped>

</style>
