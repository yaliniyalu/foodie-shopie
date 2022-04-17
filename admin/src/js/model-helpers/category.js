
export const Columns = [
  { name: '_i',             field: (r) => r._i,      label: '#',              align: 'left',   sortable: false, visible: true, filter: false },
  { name: 'id',             field: 'id',             label: 'Id',             align: 'left',   sortable: false, visible: false, hidden: true, filter: true },
  { name: 'name',           field: 'name',           label: 'Name',           align: 'left',   sortable: true, visible: true, filter: {op: 'ct'} },
  { name: 'parent',         field: '_parentId',      label: 'Name',           align: 'left',   sortable: true, filter: {null: true, default: null}, hidden: true },
  { name: 'description',    field: 'description',    label: 'Description',    align: 'left',   sortable: true },
  { name: 'image',          field: 'image',          label: 'Image',          align: 'center', sortable: false},
  { name: 'isActive',       field: 'isActive',       label: 'Status',         align: 'left',   sortable: false, visible: true, filter: {default: true} },
]

export const ActiveStatus = [
  { value: true, label: 'Active', color: 'positive', action: 'Enable' },
  { value: false, label: 'Disabled', color: 'negative', action: 'Disable' }
]
