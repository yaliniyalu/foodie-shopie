# Foodie Shopie App

E-Commerce App

1. Copy `.env.example` to `.env` and fill all fields
2. Install dependencies using command `yarn`
3. Add `google-services.json` from firebase console to `src-capacitor`

### Create splash screen and app icons
#### web
```bash
icongenie generate -m spa -i ../assets/logo/logo@1024.png
```

##### Android icon & play store icon
* Create icons using android studio
* Use icon `../assets/logo/logo@1024.png`
* Options
  * trim: `true`
  * scale: `80%`
* Play store icon will be generated in `src-capacitor\android\app\src\main\ic_launcher-playstore.png`

### Note
postinstall & postuninsatll script is include in package.json to fix an issue in capacitor-firebase-x plugin. You can manually do the changes following this procedure. Go to file `src-capacitor/node_modules/cordova-plugin-firebasex/src/android/build.gradle` and comment out `line 10` and `line 20 to 36`. [github issue](https://github.com/ionic-team/capacitor/issues/3376#issuecomment-704938840)

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```
