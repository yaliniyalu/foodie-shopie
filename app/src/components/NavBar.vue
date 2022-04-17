<template>
  <q-header :reveal="searchBar" class="bg-white text-primary" bordered @reveal="revealHeader">
    <q-toolbar>
      <q-btn flat dense round icon="arrow_back" aria-label="Back" @click="goBack" v-if="back"/>
      <q-btn flat dense round icon="menu" aria-label="Menu" v-else-if="!noMenu" @click="openMenu"/>

      <q-toolbar-title v-if="title">{{ title }}</q-toolbar-title>
      <q-toolbar-title v-else-if="logo" class="flex flex-center"><img class="logo" :src="require('src/assets/logo-hz.png')" alt="logo"/></q-toolbar-title>
      <q-toolbar-title v-else></q-toolbar-title>
      <div>
        <q-btn flat round icon="search" v-if="search" @click="openSearch"/>
<!--        <q-btn flat round icon="shopping_cart" v-if="cart" @click="openCart">
          <q-badge color="red" floating v-if="cartItems?.length">{{ cartItems.length }}</q-badge>
        </q-btn>-->
        <q-btn flat label="login" v-if="auth && !user" @click="openLogin"/>
      </div>
    </q-toolbar>
  </q-header>
  <q-toolbar class="search-toolbar fixed bg-white" :style="{top: headerShown ? '50px' : '0px'}" align="left" v-if="searchBar">
    <q-input class="search " outlined dense type="text" placeholder="Search Here" ref="searchRef" @click="searchFocused">
      <template v-slot:before v-if="!headerShown">
        <q-btn color="primary" flat round icon="menu" @click="openMenu"/>
      </template>
      <template v-slot:append>
        <q-icon name="search"/>
      </template>
    </q-input>
  </q-toolbar>
  <div style="margin-bottom: 51px" v-if="searchBar"/>
</template>

<script setup>
import {computed, ref, watch} from "vue";
import {useStore} from "vuex";
import LoginDialog from "components/dialogs/LoginDialog";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";
import SearchDialog from "components/dialogs/SearchDialog";

/*const props = defineProps({
  title: { type: String, default: null },
  noMenu: { type: Boolean, default: false },
  back: { type: Boolean, default: false },
  auth: { type: Boolean, default: false },
  cart: { type: Boolean, default: false },
  search: { type: Boolean, default: false },
  searchBar: { type: Boolean, default: false },
  logo: { type: Boolean, default: false }
})*/

const title = ref(false)
const noMenu = ref(false)
const back = ref(false)
const auth = ref(false)
const cart = ref(false)
const search = ref(false)
const searchBar = ref(false)
const logo = ref(false)

const store = useStore()
const quasar = useQuasar()
const router = useRouter()

/** @type ComputedRef<IUser> */
const user = computed(() => store.state.app.user)

/** @type ComputedRef<Array<ICart>> */
const cartItems = computed(() => store.state.cart.items)

watch(() => store.state.app.navbar, () => {
  const options = store.state.app.navbar.options.split(' ')
  title.value = store.state.app.navbar.title

  noMenu.value = options.includes('no-menu')
  back.value = options.includes('back')
  auth.value = options.includes('auth')
  cart.value = options.includes('cart')
  search.value = options.includes('search')
  searchBar.value = options.includes('search-bar')
  logo.value = options.includes('logo')
})

const searchRef = ref()
const headerShown = ref(true)

function goBack() {
  router.back()
}

function openMenu() {
  store.dispatch("app/setSideMenuOpened", true)
}

function openSearch() {
  quasar.dialog({
    component: SearchDialog
  })
}

function searchFocused() {
  searchRef.value.blur()
  openSearch()
}

function openCart() {
  router.push('/cart')
}

function openLogin() {
  quasar.dialog({
    component: LoginDialog
  })
}

function revealHeader(state) {
  headerShown.value = state
}
</script>

<style lang="scss" scoped>
.logo {
  //border-radius: 50%;
  height: 38px;
  margin-right: 8px;
  transform: rotate(0deg);
  transition: transform .8s ease-in-out;
}

.search {
  width: 100%;
  //border: 1px solid $grey;
  //padding: 5px;
}

.search-toolbar {
  //position: sticky;
  top: 0;
  z-index: 2;
  //transform: translateY(-110%);
  transition: top;
  transition-duration: 0.12s;
  transition-timing-function: cubic-bezier(0.215,0.61,0.355,1);
}
</style>
