<template>
  <div>
    <q-stepper class="q-dialog-plugin" v-model="step" ref="stepper" color="primary" animated>
      <q-step :name="1" title="Current Password" icon="vpn_key" :done="step > 1">
        <q-input :type="isPwd ? 'password' : 'text'" outlined stack-label label="Current Password" :error="!!error" :error-message="error" v-model="password" :model-value="password">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd"/>
          </template>
        </q-input>

        <div class="text-center q-mt-md">
          <q-btn color="primary" label="Next" @click="changePasswordNextStep" />
        </div>
      </q-step>

      <q-step :name="2" title="Change Password" icon="lock" :done="step > 1">
        <div class="q-gutter-md">
          <q-input :type="isPwd ? 'password' : 'text'" outlined stack-label label="New Password" v-model="password1" :model-value="password1">
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd"/>
            </template>
          </q-input>

          <q-input :type="isPwd2 ? 'password' : 'text'" outlined stack-label label="Re-enter Password" :error="!!error" :error-message="error" v-model="password2" :model-value="password2">
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd2 ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd2 = !isPwd2"/>
            </template>
          </q-input>
        </div>

        <div class="text-center q-mt-md q-gutter-md">
          <q-btn color="primary" label="Change Password" @click="changePassword" :loading="loading" />
          <q-btn color="secondary" flat label="Go Back" @click="step -= 1" />
        </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";

const step = ref(1)
const error = ref()
const loading = ref(false)
const password = ref()
const password1 = ref()
const password2 = ref()
const isPwd = ref(true)
const isPwd2 = ref(true)

watch([password, password1, password2], () => error.value = null)

function changePasswordNextStep() {
  error.value = null
  if (!password.value) {
    error.value = "Enter password"
    return
  }
  step.value += 1
}

async function changePassword() {
  error.value = null
  if (!password1.value || password1.value.length < 6) {
    error.value = "Password must be 6 characters long"
    return
  }
  if (password1.value !== password2.value) {
    error.value = "Passwords mismatch"
    return
  }
  try {
    loading.value = true
    await api.patch("auth/me/password", {
      password: password1.value,
      authenticate: password.value
    })
    ui.notifySuccess("Password changed Successfully")
  } catch (e) {
    error.value = e.response.data.error
    if (e.response.status === 403) {
      step.value = 1
    }
    return;
  } finally {
    loading.value = false
  }
  password.value = null;
  password1.value = null
  password2.value = null;
  step.value = 1
}
</script>

<style lang="scss" scoped>

</style>
