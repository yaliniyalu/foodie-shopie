export const Columns = [
  { name: '_i',             field: (r) => r._i,      label: '#',              align: 'left',   sortable: false,  visible: true, filter: false },
  { name: 'id',             field: 'id',             label: 'Id',             align: 'left',   sortable: true,  hidden: true, filter: true },
  { name: 'code',           field: 'code',           label: 'Code',           align: 'left',   sortable: true, visible: true, filter: true },
  { name: 'name',           field: 'name',           label: 'Name',           align: 'left',   sortable: true, visible: true, filter: {op: 'ct'} },
  { name: 'description',    field: 'description',    label: 'Description',    align: 'left',   sortable: true, visible: false, filter: false },
  { name: 'image',          field: 'image',          label: 'Image',          align: 'center', sortable: false, visible: false, filter: false, dbField: '->images'},
  { name: 'category',       field: row => row.category?.name,       label: 'Category',       align: 'left',   sortable: false, visible: true, filter: true, dbField: '_categoryId->category' },
  // { name: 'category_id',    field: 'category_id',    label: 'Category',       align: 'left',   sortable: true, visible: true, filter: true, dbField: 'category_id->category' },
  { name: '_categoryId',    field: '_categoryId',    label: 'Category Id',    align: 'left',   sortable: false, filter: {default: null}, hidden: true },
  { name: 'price',  field: 'price',  label: 'Selling Price',  align: 'right',   sortable: true, visible: true, filter: false },
  { name: 'maintainStock', field: 'maintainStock',  label: 'Maintain Stock', align: 'left',   sortable: false, visible: false, filter: false },
  { name: 'stock',          field: 'stock',          label: 'Stock',          align: 'right',   sortable: true, visible: true, filter: false },
  { name: 'isAvailable',   field: 'isAvailable',    label: 'Available',      align: 'center',   sortable: false, visible: true, filter: false },
  { name: 'purchaseCount', field: 'purchaseCount', label: 'Purchase Count', align: 'left',   sortable: true, visible: false, filter: false },
  { name: 'rating',         field: 'rating',         label: 'Rating',         align: 'center',   sortable: true, visible: false, filter: false },
  { name: 'isActive',      field: 'isActive',       label: 'Status',         align: 'center',   sortable: false, visible: true, filter: {default: true} }
]

export const ActiveStatus = [
  { value: true, label: 'Enabled', color: 'positive', action: 'Enable' },
  { value: false, label: 'Disabled', color: 'negative', action: 'Disable' }
]
