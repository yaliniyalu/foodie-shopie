<template>
  <div :class="widgetClass" @click="openPage">
    <img :src="getAssetsUrl(item.image || item.item?.image || item.category?.image)" alt="item-image" style="width: 100%"/>
    <div :class="wrapperClass" v-if="item.title || item.subtitle || itemOps.show.includes('title') || itemOps.show.includes('subtitle')">
      <p :class="title.class"    :style="title.style"    v-if="item.title">{{ item.title }}</p>
      <p :class="['name', ...title.class]" :style="title.style" v-else-if="itemOps.show.includes('title')">
        <template v-if="type === 'item'">{{ item.item.name }}</template>
        <template v-if="type === 'category'">{{ item.category.name }}</template>
      </p>

      <p :class="subtitle.class" :style="subtitle.style" v-if="item.subtitle">{{ item.subtitle }}</p>

      <!-- ITEM -->
      <template v-if="type === 'item'">
        <p :class="['title', ...subtitle.class]" :style="subtitle.style" v-if="itemOps.show.includes('subtitle')">
          {{ formatCurrency(item.item.price.price) }} <span class="old-price" v-if="item.item.price.price !== item.item.price.oldPrice">{{ formatCurrency(item.item.price.oldPrice) }}</span>
        </p>
        <q-badge class="offer-badge" color="positive" :label="item.item.price.discountStr" v-if="itemOps.show.includes('offer') && item.item.price.discountStr"/>

        <q-btn class="add-to-cart-btn" round icon="add" unelevated size="xs" color="primary" @click.prevent.stop="addToCart(item.item.id)" :loading="addingCart" v-if="itemOps.show.includes('add-to-cart')"/>

      </template>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, toRef, watch} from "vue";
import {getAssetsUrl, formatCurrency} from "src/js/utils";
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import ui from "src/ui";
import {parseColorStyle, parseTextStyleClass} from "src/js/builder-utils";

const props = defineProps({
  item: { type: Object, required: true },
  widget: { type: Object, required: true },
  type: { type: String, required: true }
})

const router = useRouter()
const store = useStore()

/** @type ToRef<IWidgetOptions> */
const widget = toRef(props, "widget")
/** @type Ref<IWidgetItem>*/
const itemOps = ref()

watch(widget, () => itemOps.value = widget.value.item, {deep: true, immediate: true})

const widgetClass = computed(() => {
  const cls = [
    'widget-item',
    'relative-position'
  ]

  cls.push(itemOps.value.style)
  cls.push('image-only')
  cls.push('info-' + itemOps.value.position)

  return cls
})

const title = computed(() => {
  return {
    class: ['title', ...parseTextStyleClass(itemOps.value.title.style), 'text-' + itemOps.value.align],
    style: {
      fontSize: itemOps.value.title.size + 'px',
      color: parseColorStyle(itemOps.value.title.color)
    }
  }
})

const subtitle = computed(() => {
  return {
    class: ['subtitle', ...parseTextStyleClass(itemOps.value.subtitle.style), 'text-' + itemOps.value.align],
    style: {
      fontSize: itemOps.value.subtitle.size + 'px',
      color: parseColorStyle(itemOps.value.subtitle.color)
    }
  }
})

const wrapperClass = computed(() => {
  const pos = itemOps.value.position ?? 'below'
  const cls = ['info-wrapper', ['below', 'after', 'before'].includes(pos) ? '' : 'absolute', 'pos-' + pos]

  if (itemOps.value.overlay) {
    cls.push('overlay')
  }

  return cls;
})

function openPage() {
  if (process.env.APP_TYPE === 'admin') return

  if (props.item.link) {
    router.push(props.item.link)
  } else if (props.item.item_id) {
    router.push(`/item/${props.item.item_id}`)
  } else if (props.item.category_id) {
    router.push(`/items?c=${props.item.category_id}`)
  }
}

const addingCart = ref(false)

async function addToCart(id) {
  if (process.env.APP_TYPE === 'admin') return

  await store.dispatch("app/doAuthenticated")

  addingCart.value = true
  try {
    await store.dispatch("cart/addItem", {item: {id}, qty: 1, isUpdate: false})
    ui.notifySuccess("Item added to cart")
  } catch (e) {
    ui.notifyError("Unable to add item to cart.")
  } finally {
    addingCart.value = false
  }
}
</script>

<style lang="scss" scoped>
.widget-item {
  display: flex;
  flex-direction: column;

  &.info-after {
    flex-direction: row;
  }

  &.info-before {
    flex-direction: row-reverse;
  }

  &.info-before, &.info-after {
    .info-wrapper {
      width: 40%;
      display: flex;
      justify-content: center;
      flex-direction: column;
    }
  }

  &.round {
    img {
      border-radius: 50%;
    }
  }

  &.rounded {
    img {
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }

    &.image-only {
      img {
        border-radius: 5px;
      }
    }
  }

  &.bordered {
    border: 1px solid #cccccc;
  }

  &.image-only.rounded {
    img {
      border-radius: 5px;
    }

    .overlay {
      border-radius: 5px;
    }
  }
}

.offer-badge {
  position: absolute;
  top: 5px;
  left: 5px;
}

.info-wrapper {
  padding: 5px;
  //border-bottom-left-radius: 5px;
  //border-bottom-right-radius: 5px;

  &.absolute {
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 5px;

    &.overlay {
      background-color: #000000a3;
    }

    &.pos-top {
      top: 0;
    }

    &.pos-bottom {
      bottom: 0;
    }

    &.pos-middle {
      top: 0;
      bottom: 0;
    }
  }

  p {
    margin: 0;
  }

  .name, .price, .title {
    font-size: 12px;
    color: rgb(38, 38, 38);
  }

  .old-price {
    text-decoration: line-through;
    color: $grey;
  }

  .name, .title {
    margin: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    -webkit-box-orient: vertical;
  }

  .subtitle {
    font-size: 10px;
  }
}

.add-to-cart-btn {
  position: absolute;
  right: 5px;
  bottom: 5px;
}
</style>
