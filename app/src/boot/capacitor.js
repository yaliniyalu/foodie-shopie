import { boot } from 'quasar/wrappers'
import { StatusBar, Style } from '@capacitor/status-bar';

export default boot((/* { app, router, ... } */) => {
  document.addEventListener('deviceready', () => {
    StatusBar.setBackgroundColor({ color: '#ffffff' }).then();
    StatusBar.setStyle({ style: Style.Light }).then();
    window.NavigationBar.backgroundColorByHexString("#008ecc", false);
  }, false)
})
