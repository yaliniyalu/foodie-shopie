export const Columns = [
  { name: '_i',             field: (r) => r._i, label: '#', align: 'left',   sortable: false,  visible: true, filter: false },
  { name: 'id',             field: 'id',        label: 'Id',      align: 'left',   sortable: false,  hidden: true, filter: true },
  { name: 'item', dbField: '->item', hidden: true },
  { name: 'code',           field: r => r.item[0].code,           label: 'Code',           align: 'left',   sortable: false, visible: true },
  { name: 'name',           field: r => r.item[0].name,           label: 'Name',           align: 'left',   sortable: false, visible: true },
  { name: 'selling_price',  field: r => r.item[0].price,  label: 'Selling Price',  align: 'right',  sortable: false, visible: true },
  { name: 'maintain_stock', field: r => r.item[0].maintainStock, label: 'Maintain Stock', align: 'left',   sortable: false, visible: false },
  { name: 'stock',          field: r => r.item[0].stock,          label: 'Stock',          align: 'left',   sortable: false, visible: true },
  { name: 'is_available',   field: r => r.item[0].isAvailable,   label: 'Available',      align: 'left',   sortable: false, visible: true },
  { name: 'is_active',      field: r => r.item[0].isActive,      label: 'Status',         align: 'left',   sortable: false, visible: true }
]

export const ActiveStatus = [
  { value: 1, label: 'Enabled', color: 'positive', action: 'Enable' },
  { value: 0, label: 'Disabled', color: 'negative', action: 'Disable' }
]
