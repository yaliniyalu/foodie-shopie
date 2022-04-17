<template>
  <router-view />
</template>
<script>
import { defineComponent } from 'vue';
import {useRoute} from "vue-router";
import {Toast} from "@capacitor/toast";

export default defineComponent({
  name: 'App',
  setup() {
    const route = useRoute()

    let exitApp = false
    document.addEventListener("backbutton", function (e) {
      if (route.path !== '/' && route.path !== '/home') {
        return;
      }

      e.preventDefault();

      if (exitApp) {
        navigator.app && navigator.app.exitApp()
        return
      }

      exitApp = true
      Toast.show({text: 'Press back again to exit', duration: 'short'});
      setTimeout(() => exitApp = false, 2000)
    });
  }
})
</script>
