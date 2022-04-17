<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card flat>
      <q-toolbar class="text-primary">
        <q-toolbar-title>Write Review</q-toolbar-title>
        <q-space />
        <q-btn flat round icon="close" v-close-popup/>
      </q-toolbar>

      <q-separator/>

      <q-card-section class="flex">
        <div>
          <img :src="getAssetsUrl(item.image)" alt="item image" style="width: 50px" />
        </div>
        <div class="q-ml-md">
          <b>{{ item.name }}</b>
          <p>{{ formatCurrency(item.price.price) }}</p>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section class="q-gutter-md">
        <div>
          <small class="text-grey block">Rating (required)</small>
          <q-rating v-model="rating" size="2em" :max="5" color="primary"/>
        </div>
        <q-input autogrow outlined stack-label label="Review (optional)" v-model="review"/>
        <div class="text-center">
          <q-btn color="primary" :loading="loading" :disable="!rating" unelevated label="Add Review" @click="save"/>
        </div>
      </q-card-section>

      <q-inner-loading :showing="loading">
        <q-spinner-bars size="50px" color="primary"/>
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {getAssetsUrl, formatCurrency} from 'src/js/utils';

import {useDialogPluginComponent} from "quasar";
const { dialogRef, onDialogHide } = useDialogPluginComponent()

defineEmits([...useDialogPluginComponent.emits])
const props = defineProps({
  item: { type: Object, required: true }
})

import {onMounted, ref} from "vue";
import {api} from "boot/axios";
import {useStore} from "vuex";
import ui from "src/ui";

const rating = ref(0)
const review = ref("")
const loading = ref(false)

const store = useStore()

async function load() {
  loading.value = true

  try {
    console.log(store.state.app)
    const res = await api.get(`/review?filter[_itemId]=${props.item.id}&filter[_customerId]=${store.state.app.user.id}`)

    if (res.data.data.reviews.length) {
      rating.value = res.data.data.reviews[0].rating
      review.value = res.data.data.reviews[0].review
    }
  } catch (e) {
    ui.notifyError(e.response?.data.message ?? e.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

async function save() {
  loading.value = true

  try {
    const res = await api.post('/review', {itemId: props.item.id, review: review.value, rating: rating.value})

    if (res.data.data.status === 'Pending') {
      ui.alert("Your review has been submitted. To prevent hate speech we will first review and approve your review before it appears here.")
    } else {
      ui.notifySuccess("Review submitted")
    }

    dialogRef.value.hide()
  } catch (e) {
    ui.notifyError(e.response?.data.message ?? e.message)
  } finally {
    loading.value = false
  }
}

</script>

<style lang="scss" scoped>

</style>
