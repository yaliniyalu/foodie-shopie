<template>
  <div class="layout-swiper" v-if="layout === 'swiper'">
    <SwiperTitleLink :label="type.label" :to="type.to"/>
    <swiper class="q-mt-sm" :slides-per-view="3" :space-between="5" :breakpoints="breakpoints">
      <swiper-slide v-for="i in items" @click="openItem(i)">
        <div class="item">
          <img :src="getAssetsUrl(i.image)" alt="item-image" style="width: 100%"/>
          <div class="info-wrapper">
            <p class="name">{{ i.name }}</p>
            <p class="price">{{ formatCurrency(i.price.price) }} <span class="old-price" v-if="i.price.oldPrice">{{ formatCurrency(i.price.oldPrice) }}</span></p>
            <q-badge class="offer-badge" color="positive" :label="i.price.discountStr" v-show="i.price.discountStr"/>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
  <div class="layout-grid" v-else>
    <SwiperTitleLink class="title" :label="type.label" :to="type.to"/>
    <div class="row">
      <div class="col-xs-6 col-sm-6 col-md-4 col-lg-4 item" v-ripple v-for="i in items.slice(0, 4)" @click="openItem(i)">
        <img :src="getAssetsUrl(i.image)" alt="item-image" style="width: 100%"/>
        <div class="info-wrapper">
          <p class="name">{{ i.name }}</p>
          <p class="price">{{ formatCurrency(i.price.price) }} <span class="old-price" v-if="i.price.oldPrice">{{ formatCurrency(i.price.oldPrice) }}</span></p>
          <q-badge class="offer-badge" color="positive" :label="i.price.discountStr" v-show="i.price.discountStr"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import SwiperTitleLink from "components/SwiperTitleLink";
import breakpoints from "src/js/swiper-breakpoints";
import {formatCurrency, getAssetsUrl} from "src/js/utils";
import {useRouter} from "vue-router";

defineProps({
  items: { type: Array, required: true },
  type: { type: Object, required: true },
  layout: { type: String, default: 'swiper' }
})

const router = useRouter()

function openItem(item) {
  router.push("/item/" + item.id)
}

</script>

<style lang="scss" scoped>
.item {
  .offer-badge {
    position: absolute;
    top: 5px;
    left: 5px;
  }

  .info-wrapper {
    padding: 5px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;

    p {
      margin: 0;
    }

    .name, .price {
      font-size: 12px;
      color: rgb(38, 38, 38);
    }

    .old-price {
      text-decoration: line-through;
      color: $grey;
    }

    .name {
      margin: 0;

      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* number of lines to show */
      -webkit-box-orient: vertical;
    }
  }
}

.layout-swiper .item {
  display: flex;
  flex-direction: column;
  border: 1px solid #e6e6e6;
  border-radius: 5px;
  position: relative;

  img {
    border-radius: 5px 5px 0 0;
  }
}


.layout-grid {
  border-left: 1px solid #e6e6e6;
  border-top: 1px solid #e6e6e6;

  .offer-badge {
    position: absolute;
    top: 10px;
    left: 10px;
  }

  .title {
    border-right: 1px solid #e6e6e6;
    border-bottom: 1px solid #e6e6e6;
  }

  .row {
    border-radius: 10px;
  }

  .item {
    padding: 5px;
    border-bottom: 1px solid #e6e6e6;
    border-right: 1px solid #e6e6e6;
    position: relative;
  }
}
</style>
