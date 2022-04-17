<template>
  <q-pull-to-refresh @refresh="loadWishList" ref="refreshRef">
    <q-page v-if="items.length">
      <q-list separator>
        <!--        <q-item-label header>Your Wishlist</q-item-label>-->
        <q-item clickable v-for="item in items" :key="item.id">
          <q-item-section avatar top @click="openItem(item)">
            <q-avatar rounded>
              <img :src="getAssetsUrl(item.image)" alt="image">
            </q-avatar>
          </q-item-section>

          <q-item-section top @click="openItem(item)">
            <q-item-label lines="1">
              <span class="text-weight-medium">{{ item.name }}</span>
            </q-item-label>
            <q-item-label caption lines="1">
              {{ formatCurrency(item.price.price) }} &nbsp;&nbsp;&nbsp;<span class="old-price" v-if="item.price.oldPrice">{{ formatCurrency(item.price.oldPrice) }}</span>
            </q-item-label>
            <q-item-label caption lines="1" v-if="!item.hasStock">
              <span class="text-negative">Item is unavailable</span>
            </q-item-label>
          </q-item-section>

          <q-item-section top side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn color="negative" flat round icon="delete" @click="removeFromWishlist(item)" :loading="removeLoader[item.id]" />
              <q-btn color="primary" flat round icon="shopping_cart" @click="addToCart(item)" :loading="addLoader[item.id]" :disable="!item.hasStock" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <q-inner-loading :showing="loading">
        <q-spinner-bars size="50px" color="primary"/>
      </q-inner-loading>
    </q-page>

    <q-page class="flex flex-center" v-else>
      <div class="flex flex-center column q-pa-lg" v-if="!items.length && !loading">
        <p class="text-grey text-center">Your wishlist is empty.<br/>Please add items to see it here.</p>
        <q-btn color="primary" flat label="Add Items" to="/items"/>
      </div>

      <div class="flex flex-center column q-pa-lg" v-if="!items.length && loading">
        <p class="text-grey text-center">Loading... Please wait...</p>
      </div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup>
import {getAssetsUrl, formatCurrency} from 'src/js/utils';
import NavBar from "components/NavBar";
import {computed, onMounted, reactive, ref} from "vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import ui from "src/ui";
import {useNavbar} from "src/composables/navbar";

const store = useStore()
const router = useRouter()

const removeLoader = reactive({})
const addLoader = reactive({})
const refreshRef = ref()
const loading = ref()

/** @type ComputedRef<Array<IItem>> */
const items = computed(() => store.getters['cart/getWishlist'])

useNavbar('back search cart', "My Wish List")

onMounted(() => {
  refreshRef.value.trigger();
})

function openItem(item) {
  router.push('/item/' + item.id)
}

async function removeFromWishlist(item) {
  removeLoader[item.id] = true
  try {
    await store.dispatch('cart/removeFromWishList', item)
    ui.toast("Item removed")
  } catch (e) {
    ui.notifyUnexpectedError();
  } finally {
    removeLoader[item.id] = false
  }
}

async function addToCart(item) {
  addLoader[item.id] = true
  try {
    await store.dispatch('cart/moveWishListToCart', item)
    ui.toast("Added to cart")
  } catch (e) {
    ui.notifyUnexpectedError();
  } finally {
    addLoader[item.id] = false
  }
}

async function loadWishList(done) {
  try {
    loading.value = true
    await store.dispatch('cart/fetchWishlist')
  } catch (e) {
    ui.notifyUnexpectedError();
  } finally {
    loading.value = false
    done();
  }
}


</script>

<style lang="scss" scoped>

</style>
