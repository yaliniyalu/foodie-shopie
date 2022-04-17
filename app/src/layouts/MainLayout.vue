<template>
  <q-layout view="lHh LpR lFf">
    <NavBar/>

    <q-drawer v-model="leftSideBar" show-if-above side="left" bordered>
      <SideMenu/>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive v-bind="fixKeepAlive">
          <component :is="Component" :key="$route.fullPath"/>
        </keep-alive>
      </router-view>
    </q-page-container>

    <q-footer v-if="isFooterTabShown">
      <q-tabs
        narrow-indicator
        class="bg-primary text-white shadow-2"
      >
        <q-route-tab to="/" icon="home" @click.prevent="openHome"/>
        <q-route-tab to="/cart" exact icon="shopping_cart">
          <q-badge color="red" floating v-if="cart?.items?.length">{{ cart.items.length }}</q-badge>
        </q-route-tab>
        <q-route-tab to="/contact" exact icon="contact_mail" />
        <q-route-tab to="/account" exact icon="account_circle" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import SideMenu from "components/SideMenu";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import {useRoute, useRouter} from "vue-router";
import Items from "pages/Items";
import NavBar from "components/NavBar";

const store = useStore()
const quasar = useQuasar()
const route = useRoute()
const router = useRouter()

/** @type ComputedRef<IApp> */
const app = computed(() => store.state.app.app)

/** @type ComputedRef<IUser> */
const user = computed(() => store.state.app.user)

/** @type ComputedRef<ICart> */
const cart = computed(() => store.state.cart)

const leftSideBar = computed({
  get() {
    return store.state.app.isSideMenuOpened
  },
  set(v) {
    store.commit("app/setIsSideMenuOpened", v)
  }
})

const isFooterTabShown = computed(() => {
  return !route.name?.startsWith("Checkout")
})

const mainRoute = ref(0)

watch(route, () => {
  if (["/cart", "/contact", "/account"].includes(route.path)) {
    mainRoute.value ++
  } else {
    mainRoute.value = 0
  }
})

const fixKeepAlive = process.env.NODE_ENV === 'development' ? {include: []} : {include: ['Items', 'Orders']}

onMounted(() => {
  postInit()
})

function postInit() {
  store.dispatch("app/loadCategory")
  store.dispatch("app/loadAppSettings")
}

function openHome() {
  console.log(mainRoute.value)
  if (mainRoute.value) {
    router.go(-mainRoute.value)
  } else {
    router.push('/')
  }
}
</script>
