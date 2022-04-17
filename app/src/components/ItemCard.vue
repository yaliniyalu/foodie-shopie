<template>
  <div :class="'product-card product-display-' + display" v-ripple v-if="item" @click="openItem">
    <div class="product-image ribbon-box">
      <img :src="getAssetsUrl(item.image)" alt="image">
      <div class="ribbon" v-if="item.promoTag"><span>{{ item.promoTag }}</span></div>
    </div>
    <div class="product-info">
      <span class="name">{{ item.name }}</span>
      <p class="price-info">
        <span class="price">{{ formatCurrency(item.price.price) }}<small class="text-grey" v-if="item.unit">/{{ item.unit }}</small></span>
        <span class="discount-info" v-if="item.price.oldPrice">
          <span class="text-grey old-price">{{ formatCurrency(item.price.oldPrice) }}</span>
          <span class="text-positive">{{ item.price.discountStr }}</span>
        </span>
      </p>
      <p class="q-gutter-sm" v-if="item.reviewCount">
        <RatingBadge :rating="item.rating"/> <span class="text-grey rating-count">({{ item.reviewCount }})</span>
      </p>
      <p class="stock-alert q-mb-none" v-if="!item.hasStock">
        <q-badge color="negative" label="No Stock" v-if="!item.hasStock"/>
      </p>
      <BtnAddToCart class="btn-add-cart q-mt-sm" :item="item" v-model="item.inCart" v-if="item.hasStock"/>
    </div>
  </div>

  <div :class="'product-card product-display-' + display" v-else>
    <div class="product-image">
      <q-skeleton type="rect" height="100px" />
    </div>
    <div class="product-info">
      <q-skeleton type="text" width="100%" />
      <p class="price-info">
        <q-skeleton type="text" width="80%" />
      </p>
      <p class="row q-gutter-sm">
        <q-skeleton type="QBadge" width="50px" /> <q-skeleton type="text" width="20px" />
      </p>
    </div>
  </div>
</template>

<script setup>
import {formatCurrency, getAssetsUrl} from "src/js/utils";
import {useRouter} from "vue-router";
import RatingBadge from "components/RatingBadge";
import BtnAddToCart from "components/BtnAddToCart";

const props = defineProps({
  item: { type: Object, default: null },
  display: { type: String, default: 'grid' }
})

const router = useRouter()

function openItem() {
  router.push('/item/' + props.item['id'])
}

</script>

<style lang="scss" scoped>
.product-card {
  flex: 1 16%;
  padding: 10px;

  border-right: 1px solid #eaeaea;
  border-bottom: 1px solid #eaeaea;
  position: relative;

  display: flex;
  flex-direction: column;
}

.product-image {
  img {
    max-width: 100%;
  }
}

.product-info {
  //margin-top: auto;
  text-align: left;

  .name {
    font-size: 14px;
    //line-height: 18px;
    display: block;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price {
    font-size: 16px;
  }

  .old-price, .discount {
    font-weight: lighter;
  }

  .price-info {
    margin: 0 0 2px;
  }

  .discount-info span {
    margin-left: 6px;
    font-size: 12px;
  }

  .rating-count {
    font-size: 12px;
  }
}

.product-display-list {
  &.product-card {
    flex: 1 32%;
    flex-direction: row;

    .product-info {
      flex: 3;
      padding-left: 6px;
      margin-top: 0;
    }

    .product-image {
      flex: 1;
    }

    .name {
      line-height: 1.5em; /* Sets line height to 1.5 times text size */
      height: 3em; /* Sets the div height to 2x line-height (3 times text size) */
      width: 100%; /* Use whatever width you want */
      white-space: normal; /* Wrap lines of text */
      overflow: hidden; /* Hide text that goes beyond the boundaries of the div */
      text-overflow: ellipsis; /* Ellipses (cross-browser) */
      -o-text-overflow: ellipsis; /* Ellipses (cross-browser) */
    }

    .btn-add-cart {
      max-width: 180px;
    }
  }

  @media (max-width: 920px) {
    &.product-card {
      flex: 1 41%;
      width: 41%;
    }
  }

  @media (max-width: 600px) {
    &.product-card {
      flex: 1 100%;
      width: 100%;
    }
  }
}

@media (max-width: 920px) {
  .product-card {
    flex: 1 21%;
    width: 21%;
  }
}

@media (max-width: 600px) {
  .product-card {
    flex: 1 46%;
    width: 46%;
  }
}

@import 'src/css/ribbon.scss';

@include ribbon(var(--q-primary))
</style>
