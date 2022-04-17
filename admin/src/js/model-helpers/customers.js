
export const Columns = [
  { name: '_i',             field: (r) => r._i,      label: '#',        align: 'left',   sortable: false,  visible: true, filter: false },
  { name: 'id',             field: 'id',             label: 'Id',       align: 'left',   sortable: true,  hidden: true, filter: true },
  { name: 'name',           field: 'name',           label: 'Name',     align: 'left',   sortable: true, visible: true, filter: {op: 'ct'} },
  { name: 'customerType',  field: 'customerType',   label: 'Type',     align: 'left',   sortable: true, visible: true, filter: true },
  { name: 'email',          field: 'email',          label: 'Email',    align: 'left', sortable: true },
  { name: 'phone',          field: 'phone',          label: 'Phone',    align: 'left',   sortable: true, visible: true },

  { name: 'statTotalOrders',         field: 'statTotalOrders',          label: 'Total Orders',       align: 'left',   sortable: true },
  { name: 'statTotalOrderAmount',    field: 'statTotalOrderAmount',     label: 'Total Amount Spend', align: 'right',   sortable: true },
  // { name: 'statOrderFrequency',      field: 'statOrderFrequency',       label: 'Order Frequency',    align: 'right',   sortable: false, dbField: null },
  { name: 'statTotalReviews',        field: 'statTotalReviews',         label: 'Total Reviews',      align: 'left',   sortable: true },

  { name: 'isActive',      field: 'isActive',      label: 'Status',   align: 'left',   sortable: false, visible: true, filter: {default: true} },

  { name: 'createdAt', field: 'createdAt', hidden: true}
]

export function getOrderFrequency(customer) {
  const d1 = new Date()
  const d2 = new Date(customer.createdAt)
  const d = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));

  return (customer.statTotalOrders / (d / 7)).toFixed(2)
}
