<template>
  <div :class="widgetClass">
    <div class="row q-col-gutter-sm" v-if="data.options.customers.includes('non-members')">
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-3" v-for="b in list">
        <q-btn unelevated stack :color="b.color" :to="b.to" :label="b.name" :icon="b.icon" class="full-width"/>
      </div>
    </div>
    <div class="row q-col-gutter-sm" v-else>
      <div class="col text-center flex column flex-center" v-for="b in list2">
        <q-btn round unelevated stack :color="b.color" :to="b.to" :icon="b.icon"/>
        <p class="q-ma-none text-grey">{{b.name}}</p>
      </div>
    </div>
  </div>
</template>

<script setup>

import {computed, toRef} from "vue";
import {parsePaddingClass} from "src/js/builder-utils";

const list = [
  { name: "Today's Deals", color: 'orange', to: '/items?t=today-deals', icon: 'local_offer' },
  { name: 'All Category', color: 'cyan', to: '/category', icon: 'category' },
  { name: 'Contact Us', color: 'pink', to: '/contact', icon: 'contact_mail' },
  { name: 'Account', color: 'purple', to: '/account', icon: 'account_circle' }
]

const list2 = [
  { name: 'Orders', color: 'teal', to: '/orders', icon: 'shopping_bag' },
  { name: "Cart", color: 'green', to: '/cart', icon: 'shopping_cart' },
  { name: 'Wish List', color: 'blue', to: '/wishlist', icon: 'favorite' },
  { name: 'Account', color: 'lime', to: '/account', icon: 'account_circle' }
]

const props = defineProps({
  data: {
    type: Object,
    default: false
  }
})

/** @type ToRef<IWidget> */
const widget = toRef(props, 'data')

const widgetClass = computed(() => {
  return parsePaddingClass(widget.value.options.padding)
})
</script>

<style lang="scss" scoped>

</style>
