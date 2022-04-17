<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="head q-pt-sm q-pb-sm">
        <div class="text-h6 flex items-center">My Account</div>
        <q-btn color="primary" flat round icon="edit" @click="editAccount" />
      </q-card-section>

      <q-separator/>

      <q-card-section class="account-card q-pt-none">
        <div>
          <q-item class="item text-bold">
            <q-item-section side><q-avatar icon="person" /></q-item-section>
            <q-item-section><q-item-label>{{ user.name || "Customer" }}</q-item-label></q-item-section>
          </q-item>

          <q-item class="item">
            <q-item-section side><q-avatar icon="email" /></q-item-section>
            <q-item-section><q-item-label>{{ user.email || "-" }}</q-item-label></q-item-section>
          </q-item>

          <q-item class="item">
            <q-item-section side><q-avatar icon="smartphone" /></q-item-section>
            <q-item-section><q-item-label>+91 {{ user.phone }}</q-item-label></q-item-section>
          </q-item>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section class="text-center">
        <q-btn flat unelevated color="negative" icon="logout" label="Logout" @click="logout" :loading="loggingOut"/>
      </q-card-section>

      <q-inner-loading :showing="loading">
        <q-spinner-bars size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Quick Links</div>
      </q-card-section>

      <q-separator/>

      <q-card-section class="text-center">
        <q-list>
          <q-item clickable v-ripple active to="/orders">My Orders</q-item>
          <q-item clickable v-ripple active to="/cart">My Cart</q-item>
          <q-item clickable v-ripple active to="/wishlist">My Wishlist</q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import {useStore} from "vuex";
import {computed, ref} from "vue";
import EditAccountDialog from "components/dialogs/EditAccountDialog";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";
import ui from "src/ui";
import {useNavbar} from "src/composables/navbar";

const store = useStore()
const quasar = useQuasar()
const router = useRouter()

/** @type ComputedRef<IUser>*/
const user = computed(() => store.state.app.user)

const loading = ref(false)
const loggingOut = ref(false)

useNavbar('back search cart auth', "My Account")

function editAccount() {
  quasar.dialog({
    component: EditAccountDialog
  })
}

async function logout() {
  loggingOut.value = true
  try {
    await store.dispatch("app/logout")
    await router.replace("/")
    location.reload()
  } catch (e) {
    ui.notifyError("Unable to logout. Unknown error.")
  } finally {
    loggingOut.value = false
  }
}
</script>

<style lang="scss" scoped>
.account-card {
  .item {
    padding: 0;
    //min-height: 0;
  }

  .address {
    white-space: break-spaces;
  }
}

.saved-address-card {
  //padding-bottom: 0;

  .address {
    white-space: break-spaces;
  }

  .name {
    font-weight: bold;
  }

  .mobile {
    padding-top: 5px;
  }
}

.head {
  display: flex;
  justify-content: space-between;
}

.right-buttons {
  float: right;
  position: relative;
}
</style>
