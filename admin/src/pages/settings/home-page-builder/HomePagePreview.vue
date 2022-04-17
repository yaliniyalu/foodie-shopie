<template>
<q-page>
  <Preview :widgets="widgets"/>
</q-page>
</template>

<script setup>
import Preview from "components/home-page-builder/preview/Preview";
import {onMounted, ref} from "vue";

const widgets = ref([])

onMounted(() => {
  window.top.postMessage(JSON.stringify({type: 'mounted'}), '*')
})

window.onmessage = function(e) {
  try {
    const data = JSON.parse(e.data)
    if (data.type === 'widgets') {
      data.widgets.forEach(widget => {
        widget.list.forEach(item => {
          if (item.type === 'item') {
            if (typeof item.item.price !== 'object') {
              item.item.price = {price: item.item.price, oldPrice: item.item.price}
            }
          }
        })
      })
      widgets.value = data.widgets
    }
  } catch (e) {
  }
};
</script>

<style lang="scss" scoped>

</style>
