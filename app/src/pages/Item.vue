<template>
  <ItemSkeleton v-if="!item"/>
  <q-page v-else>
    <q-card v-if="item">
      <q-card-section class="q-pa-none relative-position">
        <swiper :slides-per-view="1" :space-between="10" :modules="[Navigation, Pagination]" :pagination="{ clickable: true }">
          <swiper-slide v-for="image in item.images">
            <img :src="image" alt="image" style="width: 100%"/>
          </swiper-slide>
        </swiper>
        <q-btn class="wish-btn" round outline :color="wishBtn.color" :icon="wishBtn.icon" :loading="togglingWishlist" @click="toggleWishList"/>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-sm" v-if="item">
      <q-card-section>
        <div class="product-info">
          <span class="name">{{ item.name }}</span>
          <p class="q-gutter-sm" v-if="item.reviewCount">
            <RatingBadge :rating="item.rating"/> <span class="text-grey rating-count">{{ item.reviewCount }} ratings</span>
          </p>
          <p class="price-info">
            <span class="price">{{ formatCurrency(item.price.price) }}</span>
            <span class="text-grey text-weight-light">/{{ item.unit }}</span>
            <span class="discount-info q-ml-sm" v-if="item.price.oldPrice">
              <span class="text-grey old-price">{{ formatCurrency(item.price.oldPrice) }}</span>
              <span class="text-positive text-bold">{{ item.price.discountStr }}</span>
            </span>
            <span class="q-ml-sm" v-if="item.price.isPrimeDiscount">
              <PrimeBadge/>
            </span>
          </p>
          <p class="stock-alert" v-if="!item.hasStock || item.lowStockAlert">
            <q-badge color="negative" label="No Stock Available" v-if="!item.hasStock"/>
            <q-badge color="negative" :label="`Hurry, Only ${item.stock} available`" v-else-if="item.lowStockAlert"/>
          </p>
          <p class="q-mt-sm q-mb-sm" v-if="!item.price.isPrimeDiscount  && primeBenefit">Prime Benefit: <span class="text-positive">{{ primeBenefit }}</span></p>
          <p class="q-mt-sm q-mb-none" v-if="item.shortDescription">{{ item.shortDescription }}</p>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-sm" v-if="item && (item.description || item.specification)">
      <q-card-section>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          :breakpoint="0"
          narrow-indicator
        >
          <q-tab :name="0" label="Description" v-if="item.description" />
          <q-tab :name="item.description ? 1 : 0" label="Specification" v-if="item.specification" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel :name="0" v-if="item.description">
            <!--            <div class="text-h6">Description</div>-->
            <div v-html="item.description"></div>
          </q-tab-panel>

          <q-tab-panel :name="item.description ? 1 : 0" v-if="item.specification">
            <!--            <div class="text-h6">Specification</div>-->
            <div v-html="item.specification"></div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>

    <CurrentLocation class="q-mt-sm" v-if="item"/>

    <ReviewsCard v-if="item" class="q-mt-sm" :ratings="ratings" :item="item" :review-limit="3"/>

    <div class="q-pa-md">
      <SwiperItemList class="q-mt-lg" :items="relatedItems" :type="{label: 'Related Items'}" v-if="relatedItems.length"/>
      <SwiperItemList class="q-mt-lg" :items="recentItems" :type="{label: 'Recently Viewed Items'}" v-if="recentItems.length"/>
    </div>

    <div class="q-mb-xl"/>

    <q-page-sticky class="bg-secondary sticky-btn" expand position="bottom" :offset="[0, 0]" style="z-index: 2" v-if="item && item.hasStock">
      <div class="row">
        <div class="col">
          <q-btn unelevated style="width: 100%" size="lg" color="secondary" label="Buy Now" @click="buyNow"/>
        </div>
        <q-separator vertical/>
        <div class="col">
          <q-btn unelevated style="width: 100%" size="lg" color="secondary" label="Add to cart" @click="addToCart"/>
        </div>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper';
import {computed, onMounted, ref, watch} from "vue";
import {formatCurrency, formatDateType, formatTime, parseItem, parseModifiers} from "src/js/utils";
import {api} from "boot/axios";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";
import RatingBadge from "components/RatingBadge";
import ui from "src/ui";
import ReviewsCard from "components/ReviewsCard";
import SwiperItemList from "components/SwiperItemList";
import CurrentLocation from "components/CurrentLocation";
import ItemSkeleton from "components/skeleton/ItemSkeleton";
import PrimeBadge from "components/PrimeBadge";
import {useNavbar} from "src/composables/navbar";

const route = useRoute()
const store = useStore()
const router = useRouter()

useNavbar('back search cart auth')

const tab = ref(0)
const unparsedItem = ref()
const addingCart = ref(false)
const buyingNow = ref(false)
const loadingRelatedItems = ref(true)
const loadingRecentItems = ref(true)
const togglingWishlist = ref(false)

const isInWishlist = ref(false)

/** @type ComputedRef<{rating: number, reviewCount: number, ratings: Array}>*/
const ratings = computed(() => {
  if (!item.value) {
    return null
  }

  return {
    rating: item.value.rating,
    reviewCount: item.value.reviewCount,
    ratings: Object.keys(item.value.ratings).map(v => ({ star: v, count: item.value.ratings[v]}))
  }
})

const wishBtn = computed(() => {
  if (isInWishlist.value) {
    return {
      color: 'negative',
      icon: 'favorite'
    }
  }

  return {
    color: 'secondary',
    icon: 'favorite_outline'
  }
})

/** @type ComputedRef<IItem>*/
const item = computed(() => {
  if (!unparsedItem.value) return null;
  return parseItem(unparsedItem.value, store.state.app.user?.isPrime ?? false, modifierPrice.value)
})

/** @type ComputedRef<IUser> */
const user = computed(() => store.state.app.user)

const primeBenefit = computed(() => {
  const d = item.value?.discounts.find(v => v.isPrime)
  if (!d) {
    return null;
  }
  if (d.type === "Percent") {
    return `${Math.round(d.value)}% off`
  } else {
    return `₹${Math.round(d.value)} off`
  }
})

const deliveryTime = computed(() => {
  if (!item.value?.deliverySlot) return ''


  const type = formatDateType(item.value.deliverySlot.from)
  const from = formatTime(item.value.deliverySlot.from)
  // const to = formatTime(item.value.deliverySlot.to)

  /*  if (from === '12:00 am' && to === '11:59 pm') {
      return type
    }*/

  return `${type}, ${from}`
})

const modifierPrice = computed(() => modifiers.value?.reduce((acc, v) => acc + parseFloat(v.selected?.price ?? 0), 0) ?? 0)

const unparsedRelatedItems = ref([])
const relatedItems = computed(() => unparsedRelatedItems.value.map(v => parseItem(v)))
const unparsedRecentItems = ref([])
const recentItems = computed(() => unparsedRecentItems.value.map(v => parseItem(v)))
const modifiers = ref([])

onMounted(() => load())
watch(route, () => route.params.id && load())

async function load() {
  const fields = ['id', 'name', 'purchaseCount', 'ratingCount', 'rating', 'unit', 'isPack',
    'isAvailable', 'price', 'maintainStock', 'stock', 'short_description', 'specification', 'description']
  const res = await api.get(`/item/${route.params.id}?select=${fields.join(',')}&include=discounts;images:image;wishlist&withRating=1`)
  unparsedItem.value = res.data.data.item
  isInWishlist.value = !!unparsedItem.value['wishlist']
  modifiers.value = parseModifiers(unparsedItem.value.modifiers)

  loadRelatedItems(res.data.data.item.id)
  loadRecentItems()
}

async function loadRelatedItems(id) {
  try {
    const res = await api.get(`/item/${id}/related`)
    unparsedRelatedItems.value = res.data.data.items
  } catch (e) {
  } finally {
    loadingRelatedItems.value = false
  }
}

async function loadRecentItems() {
  if (!store.state.app.user) {
    loadingRecentItems.value = false
    return
  }

  try {
    const res = await api.get(`/item/view/log`)
    unparsedRecentItems.value = res.data.data['viewLog'].map(v => v.item)
  } catch (e) {
  } finally {
    loadingRecentItems.value = false
  }
}

function openVariant(v) {
  router.replace("/item/" + v.id)
}

async function toggleWishList() {
  await store.dispatch("app/doAuthenticated")

  try {
    togglingWishlist.value = true
    const res = await api.post('/wishlist/toggle', {itemId: item.value.id})
    isInWishlist.value = res.data.data.action === 'add'
  } catch (e) {
  } finally {
    togglingWishlist.value = false
  }
}

async function addToCart() {
  await store.dispatch("app/doAuthenticated")

  addingCart.value = true
  try {
    await store.dispatch("cart/addItem", {item: item.value, qty: 1, modifiers: modifiers.value?.filter(m => m['selected']).map(m => m['selected'].id) ?? [], isUpdate: false})
    ui.notifySuccess("Item added to cart")
  } catch (e) {
    ui.notifyError("Unable to add item to cart.")
  } finally {
    addingCart.value = false
  }
}

async function buyNow() {
  await addToCart()
  await router.push('/cart')
}

const timeTable = computed(() => {
  if (!item.value?.timeSlot) return [];

  const getSortPos = (v) => {
    if (v['date']) {
      return new Date(v['date']).getTime()/1000
    }

    switch (v['day']) {
      case 'Monday': return 8
      case 'Tuesday': return 7
      case 'Wednesday': return 6
      case 'Thursday': return 5
      case 'Friday': return 4
      case 'Saturday': return 3
      case 'Sunday': return 2
      default: return 1
    }
  }

  const to12hr = (time) => {
    const H = +time.substr(0, 2);
    const h = H % 12 || 12;
    const ampm = (H < 12 || H === 24) ? "am" : "pm";
    return  h + time.substr(2, 3) + " " + ampm;
  }

  const getData = (v) => {
    let day = v['day']
    const from = to12hr(v['from'] ?? '00:00:00')
    const to   = to12hr(v['to'] ?? '23:59:59')
    const leave = !(v['from'] && v['to'])
    let preorder = v['preorder_lock']

    if (v['date']) {
      day = formatDateType(v['date'])
    }

    if (day === 'All') {
      day = 'Everyday'
    }

    if (preorder) {
      const d = '2010-10-10 ' + (v['from'] ?? '00:00:00')
      const d1 = new Date(d)
      const d2 = new Date(d)
      d2.setHours(d2.getHours() - preorder);
      preorder = formatTime(d2)

      if (d2.getDate() === 9 && d2.getMonth() === 9) {
        preorder += ` (prev. day)`
      } else if (d2.getDate() === 10 && d2.getMonth() === 9) {

      } else {
        const diff = parseInt((d1 - d2) / (1000 * 60 * 60 * 24), 10);
        if (diff) {
          preorder += ` (${diff} days before)`
        }
      }
    }

    return {
      day, from, to, leave, preorder
    }
  }

  return item.value.timeSlot.slots
    .filter(v => !!v.is_active)
    .sort((a, b) => getSortPos(b) - getSortPos(a))
    .map(v => getData(v))
})
</script>

<style lang="scss" scoped>
.product-info {
  margin-top: auto;
  text-align: left;

  .name {
    font-size: 16px;
    //line-height: 18px;
    display: block;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price {
    font-size: 24px;
  }

  .old-price {
    text-decoration: line-through;
  }

  .old-price, .discount {
    font-weight: lighter;
  }

  .price-info {
    margin: 0 0 2px;
  }

  .discount-info span {
    margin-left: 8px;
    font-size: 14px;
  }

  .rating-count {
    font-size: 12px;
  }

  .stock-alert {
    margin: 0;
  }
}


.sticky-btn {
  .row {
    width: 100%;
  }
}

.wish-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
}
</style>
