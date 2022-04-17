import {date} from "quasar";

export const Columns = [
  { name: 'id',             field: 'id',             label: '#',               align: 'left',   sortable: true, visible: true, filter: true },
  { name: 'created_at',     field: 'createdAt',     label: 'Time',            align: 'left',   sortable: true, visible: true, filter: true },
  { name: 'customer',       field: 'customer',       label: 'Customer',        align: 'left',   sortable: false, visible: true, filter: true, dbField: '->customer' },
  { name: 'amount_total',   field: 'amountTotal',   label: 'Total',           align: 'right',   sortable: true, visible: true, filter: false },
  { name: 'amount_balance', field: 'amountBalance', label: 'Balance',         align: 'right',   sortable: true, visible: true, filter: false },
  { name: 'items_count',    field: 'itemsCount',    label: 'Items',           align: 'right',   sortable: true, visible: true, filter: false },
  { name: 'status',         field: 'status',         label: 'Status',          align: 'center',   sortable: true, visible: true, filter: true },
  { name: 'location',       field: r => r.address.location.name,       label: 'Location',        align: 'left',   sortable: false, visible: true,  filter: true },
  { name: 'assigned_to',    field: 'assignedTo',    label: 'Assigned',        align: 'left',   sortable: false, visible: true,  filter: true, dbField: '->assignedTo' },
]


export const OrderStatus = [
  { value: 'Pending', label: 'Pending', color: 'orange', hexColor: '#ff9800' },
  { value: 'Processing', label: 'Processing', color: 'deep-orange', hexColor: '#ff5722' },
  { value: 'Processed', label: 'Processed', color: 'cyan', hexColor: '#00bcd4' },
  { value: 'Dispatched', label: 'Dispatched', color: 'teal', hexColor: '#009688' },
  { value: 'Delivered', label: 'Delivered', color: 'green', hexColor: '#4caf50' },
  { value: 'Cancelled', label: 'Cancelled', color: 'red', hexColor: '#f44336' },
  { value: 'Waiting', label: 'Waiting', color: 'purple', hexColor: '#9c27b0' },
]

export const OrderItemStatus = [
  { value: 'Pending', label: 'Pending', color: 'orange' },
  { value: 'Processed', label: 'Processed', color: 'green' },
  { value: 'Cancelled', label: 'Cancelled', color: 'red' },
]

export const PaymentStatus = [
  { value: 'Paid', label: 'Paid', color: 'green' },
  { value: 'Failed', label: 'Failed', color: 'red' },
  { value: 'Pending', label: 'Pending', color: 'orange' },
  { value: 'Refunded', label: 'Refunded', color: 'purple' },
]


export const PaymentType = [
  { value: 'Cash', label: 'Cash', color: 'indigo' },
  { value: 'RazorPay', label: 'RazorPay', color: 'blue' },
]

export function formatDateTime(d) {
  const date1 = new Date(d)
  const date2 = new Date()

  date1.setHours(0, 0, 0,0)
  date2.setHours(0, 0, 0,0)

  const diff = date.getDateDiff(date2, date1, 'days')

  let dateStr = '';
  if (diff === 0) {
    dateStr = 'Today'
  } else if (diff === 1) {
    dateStr = 'Yesterday'
  } else {
    return date.formatDate(new Date(d), 'DD-MM-YYYY hh:mm a')
  }

  return dateStr + " " + date.formatDate(new Date(d), 'hh:mm a')
}

export function getStatusOptions(status) {
  return OrderStatus.find(v => v.value === status)
}

export function getStatusSortOrder() {
  return OrderStatus.map(v => v.value)
}
