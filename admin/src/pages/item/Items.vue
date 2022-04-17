<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Items</div>
          </div>

          <div class="col-auto">
            <q-btn color="primary" flat rounded icon="add" label="Add New" to="/item/new"/>
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

          :rows-per-page-options="[10, 15, 25, 50, 0]"
        >
          <template v-slot:body-cell-maintainStock="props">
            <q-td key="maintain_stock" :props="props">
              <q-badge color="teal"   label="Yes" v-if="props.value"/>
              <q-badge color="purple" label="No"  v-else/>
            </q-td>
          </template>

          <template v-slot:body-cell-stock="props">
            <q-td key="stock" :props="props">
              <span v-if="props['row']['maintain_stock']" :class="props.value <= 10 ? 'text-red' : ''">{{ props.value }}</span>
              <span v-else>-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-price="props">
            <q-td key="selling_price" :props="props" class="acc-number">{{ props.value }}</q-td>
          </template>

          <template v-slot:body-cell-isAvailable="props">
            <q-td key="is_available" :props="props">
              <q-badge color="green" label="Yes" v-if="props.value"/>
              <q-badge color="red"   label="No"  v-else/>
            </q-td>
          </template>

          <template v-slot:body-cell-isActive="props">
            <q-td key="is_active" :props="props">
              <q-badge color="green" label="Active"    v-if="props.value"/>
              <q-badge color="red"   label="Inactive"  v-else/>
            </q-td>
          </template>

          <template v-slot:body-cell-image="props">
            <q-td key="image" :props="props" class="flex flex-center">
              <img alt="img" :src="props.row.images.find(v => v.isDefault).image" v-if="props.row.images.find(v => v.isDefault)" style="height: 28px;">
            </q-td>
          </template>

          <template v-slot:top>
            <div class="q-gutter-md row">
              <q-input class="col" outlined dense stack-label label="Id" clearable v-model="filter.id.value">
                <template v-slot:append><q-icon name="qr_code"/></template>
              </q-input>
              <q-input class="col" outlined dense stack-label label="Name" clearable v-model="filter.name.value"/>
              <CategorySelect class="col" outlined dense stack-label label="Category" clearable options-dense emit-value v-model="filter._categoryId.value" :readonly="filter._categoryId.readonly"/>
              <q-select class="col" outlined dense stack-label label="Status" clearable options-dense v-model="filter.isActive.value"
                        :options="[{ label: 'Active', value: true }, { label: 'Inactive', value: false }]" map-options emit-value :readonly="filter.isActive.readonly"
              />
            </div>

            <q-space />

            <DropdownSelectMultiple dense flat icon="view_column" :options="columns" v-model="visibleColumns" option-value="name"/>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <NavigationDrawer path="/item/:id" @update="trigger"/>
  </q-page>
</template>

<script setup>
import ui from "src/ui";
import {useQuasar} from "quasar";
import {useDataTable} from "src/composables/data-table";
import CategorySelect from "components/select/SelectCategory";
import {Columns} from "src/js/model-helpers/items";
import NavigationDrawer from "components/drawers/NavigationDrawer";
import {useRouter} from "vue-router";
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
  withResponseParser,
  withOptions
} = useDataTable(Columns)

pagination.value.descending = false

onError(() => ui.notifyUnexpectedError())
withResponseParser((data) => [data.data.items, data.data.totalCount])

withOptions({
  url: 'item',
  storageKey: 'item-list'
})

function onRowClick(evt, row, index) {
  router.currentRoute.value.path === '/item'
    ? router.push('/item/' + row.id)
    : router.replace('/item/' + row.id)
}
</script>

<style lang="scss" scoped>

</style>
