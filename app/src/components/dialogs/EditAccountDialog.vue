<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card style="width: 90%">
      <q-card-section>
        <div class="text-h6">Account Info</div>
      </q-card-section>

      <q-separator />

      <q-form @submit="submitForm">
        <q-card-section class="scroll q-gutter-sm">
          <q-input outlined type="text" v-model="info.name" stack-label label="Name" :rules="[v => !!v || 'Required']">
            <template v-slot:prepend>
              <q-icon name="person"/>
            </template>
          </q-input>
<!--          <q-input type="text" lazy-rules v-model="data.mobile" stack-label label="Mobile"/>-->
          <q-input outlined type="email" v-model="info.email" stack-label label="Email">
            <template v-slot:prepend>
              <q-icon name="email"/>
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Cancel" />
          <q-btn type="submit" unelevated color="primary" label="Update" :loading="loading" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent} from "quasar";
import {computed, ref} from "vue";
import {useStore} from "vuex";
import ui from "src/ui";

const { dialogRef, onDialogHide } = useDialogPluginComponent()

defineEmits([...useDialogPluginComponent.emits])

const store = useStore()

const user = computed(() => store.state.app.user)
const loading = ref()

const info = ref({
  name: user.value.name,
  email: user.value.email
})

async function submitForm() {
  try {
    loading.value = true
    await store.dispatch("app/updateAccountInfo", info.value)
    ui.toast("Account details updated")
    dialogRef.value.hide()
  } catch (e) {
    ui.notifyError("Unable to update account details")
  } finally {
    loading.value = false
  }
}

</script>

<style lang="scss" scoped>

</style>
