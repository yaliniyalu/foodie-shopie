<template>
  <q-page class="flex justify-center flex-center">
    <q-card class="login-card">
      <q-form @submit="login">
        <q-card-section class="text-center">
          <img :src="require('src/assets/logo.png')" alt="logo" class="full-width"/>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input outlined stack-label label="Email" name="email" v-model="email">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input :type="showPassword ? 'text' : 'password'" outlined stack-label label="Password" name="password" v-model="password" >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-btn flat color="primary" no-caps label="Forget password?" @click="forgetPassword" />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn type="submit" unelevated color="primary" label="Login" :loading="isLoading"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import {ref} from 'vue';
import {useStore} from "vuex";
import {api} from "src/boot/axios";
import ui from "src/ui";
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from "quasar";
import ForgetPasswordDialog from "components/ForgetPasswordDialog";

const email = ref()
const password = ref()
const showPassword = ref(false)
const isLoading = ref(false)
const store = useStore()
const router = useRouter()
const route = useRoute()
const $q = useQuasar()

async function login() {
  let data = null;
  try {
    isLoading.value = true
    const res = await api.post('auth/login', {
      email: email.value, password: password.value
    })
    console.log(res.data)
    await store.dispatch('app/authenticate', res.data.data.token);
    ui.notifySuccess("Login successful")
    await navigateNext();
  } catch (e) {
    ui.notifyError(e.response?.data.message ?? e.message)
  } finally {
    isLoading.value = false
  }
}

function forgetPassword() {
  $q.dialog({
    component: ForgetPasswordDialog
  })
}

async function navigateNext() {
  await router.replace(route.query.next ?? '/')
}
</script>

<style scoped>
.login-card {
  width: 500px;
}
</style>
