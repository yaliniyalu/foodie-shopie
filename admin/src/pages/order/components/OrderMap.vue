<template>
  <GoogleMap
    :api-key="apiKey"
    :center="center"
    style="width: 100%; height: calc(100vh - 226px)"
    :zoom="14"
    ref="mapRef"
    :fullscreenControl="false"
    :mapTypeControl="false"
    :streetViewControl="false"
    :zoomControl="false"
  >
    <Marker :options="marker.marker" v-for="marker in markers" @click="openOrders(marker)"/>
  </GoogleMap>
</template>

<script setup>
import { GoogleMap, Marker, CustomControl } from 'vue3-google-map'
import {computed, ref, watch, watchEffect} from "vue";
import {LocalStorage, useQuasar} from "quasar";
import {getStatusOptions, OrderStatus} from "src/js/model-helpers/orders";
import OrderMarkerInfo from "pages/order/components/OrderMarkerInfo";
import {useRouter} from "vue-router";
const props = defineProps({
  rows: { type: Array, required: true }
})

const quasar = useQuasar()
const router = useRouter()

const apiKey = process.env.GMAP_API_KEY
const defaultCenter = {
  lat: 8.315413, lng: 77.214612
}

const center = computed({
  get() {
    return LocalStorage.getItem('order-map-center') ?? defaultCenter
  },
  set(v) {
    LocalStorage.set('order-map-center', v)
  }
})

let ordersDialog = null;

const mapRef = ref();
const readyFired = ref(false)
watchEffect(() => {
  if (mapRef.value?.ready && !readyFired.value) {
    readyFired.value = true
  }
})

const markers = computed(() => {
  if (!readyFired.value) {
    return []
  }

  const m = [];

  props.rows.forEach(order => {
    const locationId = order.address.location_id;
    const status = order.status;

    let data = m.find(e => e.status === status && e.locationId === locationId)
    if (!data) {
      data = {
        status,
        locationId,
        marker: {
          position: {
            lat: parseFloat(order.address.location.lat),
            lng: parseFloat(order.address.location.lng)
          },
          icon: {
            path: "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z",
            strokeColor: 'white',
            anchor: new window.google.maps.Point(12,17),
            fillOpacity: 1,
            fillColor: "",
            strokeWeight: 2,
            scale: 2,
            labelOrigin: new window.google.maps.Point(12,9)
          },
          title: order.id + '',
          label: ''
        },
        orders: []
      }
      m.push(data)
    }

    data.orders.push(order)
  })

  const OsMap = OrderStatus.map(v => v.value).reduce((acc, v, i) => { acc[v] = i; return acc }, {})

  m.forEach(v =>  {
    v.marker.label = v.orders.length + ''
    v.orders.sort((a, b) => OsMap[b.status] - OsMap[a.status])
    v.marker.icon.fillColor = getStatusOptions(v.orders[0].status).hexColor
  })

  return m;
})

function openOrders(marker) {
  if (ordersDialog) {
    try {
      ordersDialog.hide();
    } catch (e) {
    }
  }

  if (marker.orders.length === 1) {
    openOrderUrl(marker.orders[0].id)
    return
  }

  ordersDialog = quasar.dialog({
    component: OrderMarkerInfo,
    componentProps: {
      marker
    }
  })
}

function openOrderUrl(id) {
  router.currentRoute.value.path === '/order'
    ? router.push('/order/' + id)
    : router.replace('/order/' + id)
}
</script>

<style lang="scss" scoped>

</style>
