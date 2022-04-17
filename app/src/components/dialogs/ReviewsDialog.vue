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
        <q-btn flat round icon="arrow_back" v-close-popup/>
        <q-space />
        <q-btn flat label="Write Review" v-close-popup @click="writeReview"/>
      </q-toolbar>
      <ReviewsCard :ratings="ratings" :item="item"/>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent, useQuasar} from "quasar";
import ReviewsCard from "components/ReviewsCard";
import AddReviewDialog from "components/dialogs/AddReviewDialog";
import {useStore} from "vuex";

const { dialogRef, onDialogHide } = useDialogPluginComponent()

defineEmits([...useDialogPluginComponent.emits])
const props = defineProps({
  ratings: { type: Object, required: true },
  item: { type: Object, required: true }
})

const quasar = useQuasar()
const store = useStore()

async function writeReview() {
  await store.dispatch("app/doAuthenticated").catch()

  quasar.dialog({
    component: AddReviewDialog,
    componentProps: {
      item: props.item
    }
  })
}
</script>

<style lang="scss" scoped>

</style>
