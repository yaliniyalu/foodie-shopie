<template>
  <q-page ref="pageRef">
      <div v-if="category && category['bannerImage']" class="category-banner">
        <img :src="getAssetsUrl(category['bannerImage'])" alt="category image"/>
      </div>

      <div v-if="category && category['subCategory']?.length">
        <swiper class="category-swiper" :slides-per-view="'auto'" :space-between="15">
          <swiper-slide class="category-slide" v-for="c in category['subCategory']">
            <a v-ripple class="category" @click="openCategory(c)">
              <div class="wrapper">
                <img :src="getAssetsUrl(c.image)" alt="image"/>
                <div class="info-wrapper">
                  <p class="name">{{ c.name }}</p>
                </div>
              </div>
            </a>
          </swiper-slide>
        </swiper>
      </div>

      <div class="row q-pa-sm" v-if="!route.query.t">
        <q-btn class="col" color="primary" flat label="Sort" icon="sort" @click="openSortMenu"/>
        <q-btn class="col" color="primary" flat :label="layoutBtn.label" :icon="layoutBtn.icon" @click="toggleLayout"/>
      </div>
      <q-separator/>
      <div class="q-pa-sm q-gutter-md">
        <q-badge color="secondary" :label="info" v-if="info"/>
        <q-badge color="accent" :label="'sort: ' + sort" />
      </div>

      <q-separator/>

      <q-infinite-scroll @load="loadItems" ref="infiniteRef" :scroll-target="pageRef" :initial-index="0">
        <div class="flex">
          <ItemCard v-for="item in parsedItems" :key="item.id" :item="item" :display="layout"/>
        </div>
        <template v-slot:loading>
          <div class="flex">
            <ItemCard v-for="i in LIMIT" :key="i" :display="layout"/>
          </div>
        </template>
      </q-infinite-scroll>

      <p class="text-grey text-center q-mt-xl" v-if="!loading && !parsedItems.length">No Items Found :(</p>
    </q-page>
</template>

<script>
export default {
  name: 'Items',
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import ItemCard from "components/ItemCard";
import {useQuasar} from "quasar";
import {computed, onMounted, ref, watch} from "vue";
import SortOptionsDialog from "components/dialogs/SortOptionsDialog";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {api} from "boot/axios";
import {getAssetsUrl, parseItem} from "src/js/utils";
import {useNavbar} from "src/composables/navbar";

const quasar = useQuasar()
const store = useStore()
const route = useRoute()
const router = useRouter()

const { title } = useNavbar('back search cart auth', 'Items')

const sort = ref('relevance')
const layout = computed(() => store.state.app.itemsLayout)
const hasMore = ref(true)
const loading = ref(false)
const items = ref([])
const infiniteRef = ref()
const pageRef = ref()
const info = ref()
const lastPage = ref(0)

const LIMIT = 24;

/** @type ComputedRef<{label: string, icon: string}> */
const layoutBtn = computed(() => {
  if (layout.value === 'list') {
    return { label: 'List', icon: 'view_list' }
  } else {
    return  { label: 'Grid', icon: 'grid_view' }
  }
})

/** @type ComputedRef<IItem[]> */
const parsedItems = computed(() => items.value.map(v => parseItem(v, store.state.app.user?.isPrime ?? false)))

onMounted(() => {
  infiniteRef.value.reset();
  infiniteRef.value.trigger();
})

const categories = computed(() => {
  if (!store.state.app.categories?.length) {
    return [];
  }

  if (!route.params.id) {
    return store.state.app.categories
  } else {
    return store.state.app.categories.find(v => v.id === parseInt(route.params.id)).subCategory
  }
})

const category = computed(() => {
  info.value = null

  if (!route.query.c) {
    return null
  }

  const c = route.query.c

  let f = store.state.app.categories.find(v => v.id === c)
  if (!f) {
    for (const categoriesKey in store.state.app.categories) {
      f = store.state.app.categories[categoriesKey].subCategory?.find(v => v.id === c)
      if (f) {
        break
      }
    }

    if (!f) {
      return null
    }
  }

  info.value = `category: '${f.name.toLowerCase()}'`
  return f
})

onMounted(async () => {
/*  if (route.query.c) {
    const res = await api.get('category?include=subCategory;select=id,name,image,banner_image&filter[id]=' + route.query.c)
    category.value = res.data.data.categories[0]
    info.value = `category: '${category.value.name.toLowerCase()}'`
  }*/

  if (route.query.q) {
    info.value = `search: '${route.query.q.toLowerCase()}'`
  }

  if (route.query.t) {
    title.value = route.query.t.split('-').map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(' ')
    info.value = `${route.query.t}`
  }
})

watch(sort, () => {
  infiniteRef.value.reset();
  hasMore.value = true
  lastPage.value = 0
  items.value = []
  infiniteRef.value.trigger();
})

watch(hasMore, () => {
  if (hasMore.value) {
    infiniteRef.value.resume();
  } else {
    infiniteRef.value.stop();
  }
})

function getSort() {
  switch (sort.value) {
    case 'relevance':
      return 'sortByAsc=name'

    case 'popularity':
      return 'sortByDesc=purchaseCount'

    case 'newest_first':
      return 'sortByDesc=createdAt'

    case 'price_desc':
      return 'sortByDesc=price'

    case 'price_asc':
      return 'sortByAsc=price'
  }
}

const SELECT = ['id', 'name', 'purchaseCount', 'ratingCount', 'rating', 'isAvailable', 'price', 'maintainStock', 'stock', 'unit']
const INCLUDE = ['discounts', 'images', 'cart']

function getQuery(page) {
  if (route.query.t || route.query.w) {
    return getFeaturedQuery(page)
  }

  const query = [];
  if (route.query.c) {
    query.push(`filter[_categoryId]=${route.query.c}`)
  }

  if (route.query.q) {
    query.push(`search[name]=${route.query.q}`)
  }

  if (route.query.t === 'popular' && sort.value !== 'popularity') {
    query.push('sortByDesc=purchaseCount')
  }

  query.push(`select=${SELECT.join(',')}`)
  query.push(`include=${INCLUDE.join(';')}`)
  query.push('filter[isActive]=true')
  query.push(getSort())
  query.push(`limit=${LIMIT}`)
  query.push(`page=${page}`)

  return query.join('&')
}

function getFeaturedQuery(page) {
  const query = [];
  if (route.query.t) {
    // query.push('filter[type]=' + route.query.t)
    query.push(`select=id`)
  }

  if (route.query.w) {
    query.push('filter[home_widget_id]=' + route.query.w)
    query.push(`select=id,item_id,home_widget_id`)
  }

  const includes = []
  includes.push('item:' + SELECT.join(','))
  includes.push(...INCLUDE.map(v => 'item.' + v))

  query.push(`include=${includes.join(';')}`)
  // query.push('filter[item.isActive]=1')
  // query.push(`limit=${LIMIT}`)
  // query.push(`page=${page}`)

  return query.join('&')
}

async function fetchItems(page) {
  loading.value = true
  let url = 'item'
  if (route.query.t === 'featured' || route.query.t === 'today-deals') {
    url = 'featured-items'
  } else if (route.query.w) {
    url = 'widget-items'
  }

  try {
    const res = await api.get(url + '?' + getQuery(page));
    let rawItems = res.data.data.items;
    /*if (url !== 'item') {
      rawItems = rawItems.map(v => v.item)
    }*/

    items.value.push(...rawItems);
    if (!res.data.data.items.length || res.data.data.items.length < LIMIT) {
      hasMore.value = false
    }
  } catch (e) {
    hasMore.value = false
  }
  loading.value = false
}

async function loadItems(index, done) {
  if (!hasMore.value || loading.value || lastPage.value === index) {
    done()
    return;
  }

  try {
    lastPage.value = index
    await fetchItems(index)
  } finally {
    done();
  }
}

function openSortMenu() {
  quasar.dialog({
    component: SortOptionsDialog,
    componentProps: {
      sort: sort.value
    }
  }).onOk(s => sort.value = s)
}

function toggleLayout() {
  store.dispatch("app/setItemsLayout", layout.value === 'grid' ? 'list' : 'grid')
}

function openCategory(c) {
  router.push('/items?c=' + c.id)
}
</script>

<style lang="scss" scoped>
.category-banner img {
  height: 100px;
  width: 100%;
  object-fit: cover;
}

.category {
  .wrapper {
    height: 50px;
    display: inline-block;
    text-align: center;
    img {
      width: 50px;
      height: 100%;
      border-radius: 50%;
    }

    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* number of lines to show */
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}
.category-swiper {
  margin: 8px 10px;
  .category-slide {
    width: 100px;
  }
}
</style>
