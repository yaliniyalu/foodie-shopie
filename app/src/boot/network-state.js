import { boot } from 'quasar/wrappers'
import { Network } from '@capacitor/network';
import {Notify} from "quasar";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  let disconnected = false;
  Network.addListener('networkStatusChange', status => {
    if (status.connected) {
      if (disconnected) {
        location.reload()
      }
      disconnected = false
    } else {
      disconnected = true

      Notify.create({
        message: "Internet Disconnected",
        color: "primary",
        timeout: 0,
        icon: 'wifi_off'
      })
    }
  });
})
