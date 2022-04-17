<template>
  <q-page class="q-pa-sm" v-if="categories.length">
    <div class="row container q-col-gutter-sm">
      <CategoryCard v-for="c in categories" :category="c" class="category-item relative-position col-4 col-md-4 col-sm-4 col-lg-2"/>
    </div>
  </q-page>
  <q-page class="flex flex-center" v-else>
    <div class="flex flex-center column q-pa-lg">
      <q-icon color="grey" size="xl" name="category"/>
      <p class="text-grey text-center q-mt-md">No items found :(</p>
    </div>
  </q-page>
</template>

<script setup>
import CategoryCard from "components/CategoryCard";
import {computed} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import {useNavbar} from "src/composables/navbar";

const store = useStore()
const route = useRoute()

useNavbar('back search cart auth', "Categories")

/** @type ComputedRef<Array> */
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
</script>

<style lang="scss" scoped>
.container {
  position: relative;
}

.category-item {
  position: relative;
  text-align: center;

}
</style>
