import {getDiscountStr} from "src/js/utils";

export const Columns = [
  { name: '_i',       field: (r) => r._i, label: '#', align: 'left',   sortable: false,  visible: true, filter: false },
  { name: 'id',        field: 'id',        label: 'Id',      align: 'left',   sortable: true,  hidden: true, filter: true },
  { name: 'code',           field: 'code',           label: 'Code',           align: 'left',   sortable: true, visible: true, filter: {op: 'sw'} },
  { name: 'customerType',  field: 'customerType',  label: 'Customer',       align: 'left',   sortable: true, visible: true, filter: false },
  { name: 'discount',       field: row => getDiscountStr(row.discountValue, row.discountType),       label: 'Discount',       align: 'right',   sortable: false, visible: true, filter: false, dbField: false },
  { name: 'discountValue', field: 'discountValue',  hidden: true },
  { name: 'discountType',  field: 'discountType',  hidden: true },

  { name: 'usageLimit',        field: 'usageLimit',        label: 'Usage Limit',         align: 'right',   sortable: true, visible: false, filter: false },
  { name: 'minOrderValue',    field: 'minOrderValue',    label: 'Min. Order Value',    align: 'right',   sortable: true, visible: false, filter: false },
  { name: 'maxDiscountValue', field: 'maxDiscountValue', label: 'Max. Discount Value', align: 'right',   sortable: true, visible: false, filter: false },

  { name: 'expiresOn',     field: 'expiresOn',     label: 'Expires On',     align: 'left',    sortable: true, visible: true, filter: false },
  { name: 'isActive',      field: 'isActive',      label: 'Status',         align: 'left',   sortable: false,  visible: true, filter: {default: true} },
]

export const ActiveStatus = [
  { value: true, label: 'Active', color: 'positive', action: 'Enable' },
  { value: false, label: 'Disabled', color: 'negative', action: 'Disable' }
]

export const CustomerTypes = [
  {label: 'Any', value: "", color: 'purple'},
  {label: 'Normal', value: 'Normal', color: 'teal'},
  {label: 'Prime', value: 'Prime', color: 'cyan'}
]
