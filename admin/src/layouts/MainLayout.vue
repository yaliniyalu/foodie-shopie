<template>
  <q-layout view="hHh LpR lfr">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
            <img :src="require('src/assets/logo.png')" alt="logo" class="full-height logo">
        </q-toolbar-title>

        <q-space />

        <div class="flex flex-center">
          <q-btn flat icon="notifications">
            <q-badge color="red" floating v-if="notificationsCount">{{ notificationsCount }}</q-badge>
            <q-menu style="min-width: 250px" @before-show="loadNotifications">
              <q-list bordered separator v-if="notificationsCount">
                <template v-for="n in notifications">
                  <q-item clickable v-ripple @click="() => $router.push(NotificationData[n.id].to)" v-if="n.count > 0">
                    <q-item-section avatar top>
                      <q-avatar :icon="NotificationData[n.id].icon" :color="NotificationData[n.id].color" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ NotificationData[n.id].label }}</q-item-label>
                      <q-item-label caption>{{ NotificationData[n.id].caption }}</q-item-label>
                    </q-item-section>
                    <q-item-section side top class="acc-number"><q-badge :color="NotificationData[n.id].color" :label="n.count"/></q-item-section>
                  </q-item>
                </template>
              </q-list>
              <q-list v-else>
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-grey text-center">No Notifications :)</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>


        <q-btn stretch flat :label="user.name">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column items-center">
                <q-avatar size="72px"><img :src="getAvatarUrl(user)"></q-avatar>
                <span class="text-bold text-primary">{{ user.name }}</span>
                <span class="text-grey">{{ user.email }}</span>
                <q-btn class="q-mt-md" unelevated color="primary" label="Logout" push size="sm" @click="logout" v-close-popup/>
              </div>
            </div>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
      :width="220"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header class="text-grey-8">
            Menu
          </q-item-label>

          <template v-for="link in linksList">
            <q-item :to="link.to" :exact="link.exact" clickable v-ripple v-if="!link.children">
              <q-item-section avatar>
                <q-icon color="primary" :name="link.icon" />
              </q-item-section>

              <q-item-section>{{ link.title }}</q-item-section>
            </q-item>
            <q-expansion-item :content-inset-level="0.5" :label="link.title" v-else>
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon color="primary" :name="link.icon" />
                </q-item-section>

                <q-item-section>{{ link.title }}</q-item-section>
              </template>

              <q-list>
                <q-item :to="l.to" :exact="l.exact" clickable v-ripple v-for="l in link.children">
                  <q-item-section avatar>
                    <q-icon color="primary" :name="l.icon" />
                  </q-item-section>

                  <q-item-section>{{ l.title }}</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </template>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-white text-grey text-center">
      <span>&copy; 2021 Foodie Shopie. All rights reserved.</span>
    </q-footer>
  </q-layout>
</template>

<script setup>
import {useStore} from "vuex";

const linksList = [
  {title: "Home", icon: 'home', to: '/', exact: true},
  {title: "Analytics", icon: 'analytics', to: '/analytics', exact: true},
  {
    title: "Inventory", icon: 'inventory_2', children: [
      {title: "Category", icon: 'category', to: '/category', exact: false},
      {title: "Items", icon: 'shopping_bag', to: '/item', exact: false},
      {title: "Coupons", icon: 'redeem', to: '/coupon', exact: false},
      {title: "Today Deals", icon: 'event', to: '/today-deals', exact: false},
    ]
  },
  {
    title: "Customer", icon: 'support_agent', children: [
      {title: "Customers", icon: 'groups', to: '/customer', exact: false},
      {title: "Reviews", icon: 'reviews', to: '/review', exact: false},
      {title: "Messages", icon: 'email', to: '/message', exact: false},
    ]
  },
  {title: "Orders", icon: 'shopping_cart', to: '/order', exact: false},
  {title: "Accounts", icon: 'people', to: '/account', exact: false},
  {
    title: "Settings", icon: 'settings', children: [
      {title: "Locations", icon: 'location_on', to: '/settings/location', exact: false},
      {title: "Home Builder", icon: 'view_carousel', to: '/settings/home/builder', exact: false},
      {title: "Other Settings", icon: 'settings_applications', to: '/settings/other', exact: false},
    ]
  },
  {title: "My Account", icon: 'manage_accounts', to: '/account/me', exact: true}
];

import {computed, ref} from 'vue'
import {getAvatarUrl} from "src/js/utils";
import {api} from "boot/axios";
import ui from "src/ui";
import {useRouter} from "vue-router";

const store = useStore()
const router = useRouter()

const leftDrawerOpen = ref(false)
const user = computed(() => store.state.app.user)
const notifications = ref([])
const notificationsCount = computed(() => notifications.value.reduce((a, v) => a + parseInt(v.count), 0))

const NotificationData = {
  reviews_ending:    { label: 'Reviews',  caption: 'Pending',  color: 'cyan',   icon: 'reviews', to: '/review?filter[status]=Pending' },
  messages_pending:  { label: 'Messages', caption: 'Pending',  color: 'indigo', icon: 'email', to: '/message?filter[status]=Pending' },
  order_pending:     { label: 'Orders', caption: 'Pending',    color: 'blue',   icon: 'shopping_cart', to: '/order?filter[status]=Pending' },
  orders_unassigned: { label: 'Orders', caption: 'Unassigned', color: 'purple', icon: 'delivery_dining', to: '/order?filter[status]=Pending' },
  tasks:             { label: 'Tasks',  caption: 'Failed',     color: 'teal',   icon: 'task', to: '/system/task' },
}

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function logout() {
  ui.showLoader("Logging out...")
  try {
    await store.dispatch('app/logout')
    await router.push('/login')
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    ui.hideLoader()
  }
}

async function loadNotifications() {
  const res = await api.get('notifications')

  notifications.value = res.data.data
}

loadNotifications()
setInterval(loadNotifications, 2 * 60 * 1000)
</script>

<style lang="scss">
.logo {
  max-height: 40px;
  display: block;
  background: rgb(255, 220, 137);
  margin: 5px;
  border-radius: 4px;
}
</style>
