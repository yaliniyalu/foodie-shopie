<template>
  <div class="row">
    <div class="col text-center flex flex-center column">
      <div class="text-h5">{{ rating.toFixed(1) }}★</div>
      <div class="text-grey">{{ reviewCount }} reviews</div>
    </div>
    <q-separator vertical/>
    <div class="col q-pa-md">
      <div class="q-mt-xs flex items-center no-wrap" v-for="r in ratings">
        <span class="q-pr-sm">{{ r.star }}★</span>
        <q-linear-progress :color="getColor(r.star)" :value="getProgress(r.count)" class="" />
        <span class="text-grey text-left q-pl-sm">{{ r.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  rating: { type: Number, required: true },
  reviewCount: { type: Number, required: true },
  ratings: { type: Array, required: true },
})

function getProgress(count) {
  const per = ((count * 100) / props.reviewCount) / 100
  return isNaN(per) ? 0 : per;
}

function getColor(rating) {
  if (rating >= 3) {
    return 'positive'
  } else if (rating >= 2) {
    return 'warning'
  } else {
    return 'negative'
  }
}
</script>

<style lang="scss" scoped>

</style>
