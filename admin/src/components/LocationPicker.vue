<template>
  <q-dialog ref="dialogRef">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section style="height: 60vh">
        <GoogleMap
          :api-key="apiKey"
          :center="center"
          style="width: 100%; height: 100%"
          :zoom="14"
          ref="mapRef"
          :fullscreenControl="false"
          :mapTypeControl="false"
          :streetViewControl="false"
          :zoomControl="false"
        >
          <CustomControl position="TOP_LEFT">
            <input type="text" class="places-search" ref="inputRef">
          </CustomControl>
          <Marker :options="markerOptions" ref="markerRef" @dragend="positionChanged"/>
        </GoogleMap>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" v-close-popup/>
        <q-btn unelevated color="primary" label="Ok" @click="onOk"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { GoogleMap, Marker, CustomControl } from 'vue3-google-map'
import {useDialogPluginComponent} from "quasar";
import {computed, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect} from "vue";

const apiKey = process.env.GMAP_API_KEY
const center = ref({
  lat: 13.081738004986962, lng: 80.27635305703805
})

const markerOptions = computed(() => ({
  position: center.value, draggable: true
}))

const { dialogRef, onDialogOK } = useDialogPluginComponent()

const markerRef = ref()
const mapRef = ref()
const inputRef = ref()

const position = ref(center.value)
const pincode = ref()

let readyFired = false

watchEffect(() => {
  if (mapRef.value?.ready && !readyFired) {
    readyFired = true
    ready()
  }
})

onBeforeUnmount(() => {
  if (autocompleteHandle) {
    autocompleteHandle.remove();
  }
})

let autocomplete = null
let autocompleteHandle = null

function ready() {
  autocomplete = new window.google.maps.places.Autocomplete(inputRef.value, { types: ['geocode'] })
  autocompleteHandle = autocomplete.addListener('place_changed', autocompleteChange)

  const circle = new window.google.maps.Circle({
    center: center.value,
    radius: 1000
  });
  autocomplete.setBounds(circle.getBounds());

  navigator.geolocation.getCurrentPosition(function(position) {
    const geolocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    center.value = geolocation
    position.value = geolocation

    const circle = new window.google.maps.Circle({
      center: geolocation,
      radius: position.coords.accuracy
    });
    autocomplete.setBounds(circle.getBounds());
  });
}

function autocompleteChange() {
  const place = autocomplete.getPlace();

  if (place?.geometry?.location) {
    center.value = place.geometry.location
    position.value = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
  }

  if (place?.address_components) {
    const ad = place['address_components'].find(v => v.types.includes('postal_code'))
    if (ad !== -1) pincode.value = ad['long_name']
  }
}

function positionChanged(e) {
  const geocoder = new window.google.maps.Geocoder()
  inputRef.value.value = ""
  position.value = {
    lat: e.latLng.lat(),
    lng: e.latLng.lng()
  }

  geocoder.geocode({'latLng': e.latLng}, (response) => {
    if (response && response.length > 0) {
      const ad1 = response[0]['address_components'].findIndex(v => v.types.includes('political'))
      const ad2 = response[0]['address_components'].findIndex((v, i) => v.types.includes('political') && i !== ad1)
      const ad3 = response[0]['address_components'].findIndex((v, i) => v.types.includes('postal_code'))

      let place = '';

      if (ad1 !== -1) place += response[0]['address_components'][ad1]['long_name']
      if (ad2 !== -1) place += ', ' + response[0]['address_components'][ad2]['long_name']
      if (ad3 !== -1) pincode.value = response[0]['address_components'][ad3]['long_name']

      inputRef.value.value = place
    }
  })
}

function onOk() {
  dialogRef.value.hide()
  onDialogOK({
    location: position.value,
    place: inputRef.value.value,
    pincode: pincode.value
  })
}
</script>

<style lang="scss" scoped>

</style>

<style>
.pac-container {
  z-index: 10000 !important;
}

.places-search {
  padding: 7px 14px;
  margin: 10px;
  width: 30%;
  min-width: 300px;
  font-family: Roboto;
  font-size: 15px;
  font-weight: 300;
  text-overflow: ellipsis;
  border: 0;
  border-radius: 2px 0 0 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
</style>
