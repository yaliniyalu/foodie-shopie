<template>
  <a v-ripple class="category" @click="openCategory">
    <div class="relative-position" style="width: 100%; min-height: 100px">
      <img :src="getAssetsUrl(category.image)" alt="image"/>
      <div class="info-wrapper">
        <p class="name">{{ category.name }}</p>
      </div>
    </div>
  </a>
</template>

<script setup>
import {useRouter} from "vue-router";
import {getAssetsUrl} from "src/js/utils";

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function openCategory() {
  router.push("/items?c=" + props.category.id)
}
</script>

<style lang="scss" scoped>
.category {
  border-radius: 5px;
  display: flex;
  position: relative;

  img {
    border-radius: 5px;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .info-wrapper {
    position: absolute;
    z-index: 5;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #000000a3;
    color: #fff;
    display: flex;
    padding: 5px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;

    .name {
      margin: 0;
      font-size: 12px;
      color: #fff;

      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* number of lines to show */
      -webkit-box-orient: vertical;
    }
  }
}
</style>
