import { boot } from 'quasar/wrappers'

import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "swiper/css/thumbs"

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ( { app } ) => {
  // something to do

  app.component('VueCropper', VueCropper)
})
