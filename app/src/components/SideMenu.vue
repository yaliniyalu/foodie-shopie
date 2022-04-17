<template>
  <div>
    <q-toolbar class="bg-primary text-white" v-if="user && user.id">
      <q-icon size="lg" name="account_circle"/>
      <q-toolbar-title class="title">
        <div class="name" v-if="user.name">{{ user.name }}</div>
        <div class="phone text-grey-4">+91 {{ user.phone }}</div>
      </q-toolbar-title>
      <PrimeBadge v-if="user.isPrime"/>
    </q-toolbar>
    <div class="flex flex-center q-mt-sm" v-else>
      <img :src="app.logo" alt="logo" style="width: 100%"/>
    </div>
    <q-list>
      <template v-for="(page, i) in appPages" :key="i">
        <q-item clickable v-ripple :to="page.url" v-if="typeof page === 'object' && (!page.sub || !page.sub.length)" @click="page.onClick">
          <q-item-section avatar>
            <q-icon color="secondary" :name="page.icon" v-if="page.icon"/>
            <q-avatar rounded v-else-if="page.image">
              <img :src="getAssetsUrl(page.image)" :alt="page.title">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ page.title }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-expansion-item
          expand-separator
          v-else-if="typeof page === 'object' && page.sub && page.sub.length"
          :model-value="openedMenu === page.id"
          @update:model-value="openedMenu === page.id ? openedMenu = null : openedMenu = page.id"
        >
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon :name="page.icon" v-if="page.icon"/>
              <q-avatar rounded v-else-if="page.image">
                <img :src="getAssetsUrl(page.image)" :alt="page.title">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              {{ page.title }}
            </q-item-section>
          </template>

          <q-list>
            <q-item style="padding-left: 42px;" clickable v-ripple :to="s.url" @click="s.onClick" v-for="(s, i) in page.sub" :key="i">
              <q-item-section avatar v-if="s.icon">
                <q-icon color="secondary" v-if="s.icon"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ s.title }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

        <q-separator v-else-if="typeof page === 'undefined'"/>

        <q-item-label header class="text-grey-8" v-if="typeof page === 'string'">{{ page }}</q-item-label>
      </template>
    </q-list>
  </div>
</template>

<script setup>
import PrimeBadge from "components/PrimeBadge";
import {useStore} from "vuex";
import {computed, ref} from "vue";
import {getAssetsUrl} from "src/js/utils";
import {useRouter} from "vue-router";

const appPages = computed(() => {
  const links = [
    "Quick Links",
    {title: 'Home', url: '/home', icon: 'home'},
    {title: 'Shop By Category', url: '/category', icon: 'category'},
    {title: 'Todays Deal', url: '/items?t=today-deals', icon: 'local_offer'},
    undefined,
    {title: 'My Cart', url: '/cart', icon: 'shopping_cart'},
    {title: 'My Wishlist', url: '/wishlist', icon: 'favorite'},
    {title: 'My Orders', url: '/orders', icon: 'shopping_bag'},
    {title: 'My Account', url: '/account', icon: 'account_circle'},
    undefined,
    {title: 'Contact Us', url: '/contact', icon: 'contact_mail'},
    {title: 'About', url: '/about', icon: 'info'}
  ]

  const categories = store.state.app.categories;
  if (categories && categories.length) {
    links.unshift(
      ...categories.map(v => {

        const sub = v?.subCategory?.map(w => ({ title: w.name, id: w.id, onClick: () => openCategory(w.id) })) ?? []
        return {title: v.name, image: v.image, id: v.id, sub, onClick: () => openCategory(v.id) }
      }),
      undefined
    )
  }

  return links;
})

const openedMenu = ref()

const store = useStore()
const router = useRouter()

/** @type ComputedRef<IUser> */
const user = computed(() => store.state.app.user)

/** @type ComputedRef<IApp> */
const app = computed(() => store.state.app.app)

function openCategory(id) {
  router.push('items?c=' + id)
}
</script>

<style lang="scss" scoped>
.title {
  .name {
    line-height: 1;
  }

  .phone {
    font-size: 12px;
  }
}

</style>

<style>
.q-router-link--exact-active .q-icon {
  color: var(--q-primary) !important;
}
</style>
