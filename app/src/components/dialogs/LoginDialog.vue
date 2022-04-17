<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="q-dialog-plugin">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Login/Register</q-toolbar-title>
        <q-space />
        <q-btn flat round icon="close" v-close-popup/>
      </q-toolbar>

      <q-card-section>
        <q-banner :class="`bg-${isError ? 'negative' : 'primary'} text-white q-mb-md`" v-if="infoText">{{infoText}}</q-banner>

        <q-form @submit="sendOtp">
          <q-input outlined stack-label autofocus v-model="mobile" label="Mobile No" :disable="sendingOtp || isMobileVerified">
            <template v-slot:prepend>
              <span>+91</span>
            </template>
          </q-input>

          <div class="q-mt-md flex justify-center" v-if="!isMobileVerified">
            <q-btn type="submit" unelevated color="primary" label="Send Otp" :loading="sendingOtp" id="sign-in-button"/>
          </div>
        </q-form>

        <q-form @submit="verify">
          <div class="q-mt-md" v-if="isMobileVerified">
            <q-input outlined stack-label v-model="otp" label="Otp" mask="######" unmasked-value :disable="verifying"/>

            <div class="q-mt-md flex justify-center">
              <q-btn type="submit" unelevated color="primary" label="Login" :loading="verifying"/>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {Platform, useDialogPluginComponent} from 'quasar'

import {usePhoneAuth} from "src/composables/phone-auth";
import ui from "src/ui";
import {useStore} from "vuex";
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

const emits = defineEmits([...useDialogPluginComponent.emits])

const store = useStore()

const {
  mobile,
  otp,
  sendingOtp,
  verifying,
  isMobileVerified,
  infoText,
  isError,
  onLoggedIn,
  sendOtp,
  verify
} = usePhoneAuth(Platform.is.capacitor ? 'firebase-capacitor' : 'firebase-web')

onLoggedIn(() => {
  ui.notifySuccess("Login Successful")

  dialogRef.value.hide()
  onDialogOK()

  postLogin()
})

function postLogin() {
  store.dispatch("cart/fetchCart")
  store.dispatch("app/updateFcm")
}

</script>

<style lang="scss" scoped>
</style>
