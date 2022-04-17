<template>
  <q-card v-if="ratings">
    <q-card-section class="flex items-center justify-between q-pt-none q-pb-none">
      <b>Ratings & Reviews</b>
      <q-btn flat color="primary" label="Write Review" @click="writeReview" v-if="reviewLimit"/>
    </q-card-section>

    <q-card-section>
      <RatingCard :rating="ratings.rating" :review-count="ratings.reviewCount" :ratings="ratings.ratings"/>
    </q-card-section>

    <q-separator/>

    <q-card-section v-if="reviews.length">
      <div class="q-mt-xs q-mb-sm" v-for="r in reviews.slice(0, 3)">
        <div class="flex justify-between">
          <RatingBadge :rating="r.rating"/>
          <div class="text-grey text-right">{{ r.name }}</div>
        </div>
        <p class="q-mt-xs q-ma-none">{{ r.review }}</p>

        <q-separator class="q-mt-xs"/>
      </div>
      <div class="text-center" v-if="reviewLimit">
        <q-btn flat color="primary" @click="viewAllReviews" :loading="loading">View All {{ ratings.reviewCount }} Reviews</q-btn>
      </div>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-bars color="primary" size="50px"/>
    </q-inner-loading>
  </q-card>
  <ReviewsCardSkeleton v-else/>
</template>

<script setup>
import {onMounted, ref, toRefs} from "vue";
import RatingCard from "components/RatingCard";
import RatingBadge from "components/RatingBadge";
import {api} from "boot/axios";
import {useQuasar} from "quasar";
import ReviewsDialog from "components/dialogs/ReviewsDialog";
import AddReviewDialog from "components/dialogs/AddReviewDialog";
import LoginDialog from "components/dialogs/LoginDialog";
import {useStore} from "vuex";
import ReviewsCardSkeleton from "components/skeleton/ReviewsCardSkeleton";

const props = defineProps({
  item: { type: Object, required: true },
  ratings: { type: Object, required: true },
  reviewLimit: { type: Number, default: null }
})

const quasar = useQuasar()
const store = useStore()

const {ratings} = toRefs(props)
const reviews = ref([])
const loading = ref(false)

onMounted(() => loadReview())

async function loadReview() {
  loading.value = true
  const query = [];
  if (props.reviewLimit) query.push("limit=" + props.reviewLimit)

  query.push('filter[_itemId]=' + props.item.id)
  query.push('filter[status]=' + 'Approved')

  try {
    const res = await api.get(`/review?` + query.join('&'))
    reviews.value = res.data.data['reviews']
  } catch (e) {
  } finally {
    loading.value = false
  }
}

async function viewAllReviews() {
  quasar.dialog({
    component: ReviewsDialog,
    componentProps: {
      item: props.item,
      ratings
    }
  })
}

async function writeReview() {
  await store.dispatch("app/doAuthenticated").catch()

  quasar.dialog({
    component: AddReviewDialog,
    componentProps: {
      item: props.item,
    }
  })
}
</script>

<style lang="scss" scoped>

</style>
