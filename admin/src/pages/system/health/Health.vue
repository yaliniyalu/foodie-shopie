<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 q-ma-none">Sites</div>
              </div>
              <div class="col text-right">
                <q-btn unelevated rounded color="primary" label="Check Health" @click="checkHealth" :disable="checking"/>
              </div>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            <q-markup-table flat bordered separator="cell">
              <thead>
              <tr>
                <th>Site</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>SSL Expiry</th>
                <th>Open</th>
              </tr>
              </thead>

              <tbody>
              <tr v-for="site in healthSites">
                <td class="text-bold">
                  {{ site.name }} <br/>
                  <span class="text-grey">{{ site.url }}</span>
                </td>
                <template v-if="site.health">
                  <td>
                    <q-badge color="positive" label="Online" v-if="site.health.http_code === 200"/>
                    <q-badge color="negative" label="Error" v-else/>
                  </td>
                  <td>{{ site.health.total_time.toFixed(3) }}s</td>
                  <td>
                    <q-badge :color="getSslExpiryColor(site.health.ssl_expiry)" :label="getSslExpiryText(site.health.ssl_expiry)"/>
                  </td>
                </template>
                <template v-else>
                  <td/>
                  <td/>
                  <td/>
                </template>
                <td><q-btn flat round icon="arrow_forward" color="primary" @click="openUrl(site.url)"/></td>
              </tr>
              </tbody>
            </q-markup-table>

            <q-inner-loading :showing="checking">
              <q-spinner-pie size="50" color="primary"/>
            </q-inner-loading>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6" v-for="g in groupedSites">
        <q-card>
          <q-card-section v-if="g[0].group">
            <div class="text-h6 q-ma-none">{{ g[0].group }}</div>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            <q-list bordered separator>
              <q-item v-for="site in g">
                <q-item-section avatar>
                  <q-icon color="primary" :name="site.icon" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ site.name }}</q-item-label>
                  <q-item-label caption lines="1">{{ site.url }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round icon="arrow_forward" color="primary" @click="openUrl(site.url)"/>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-bars size="50" color="primary"/>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import {computed, ref} from "vue";
import {api} from "boot/axios";
import { date } from 'quasar'
import ui from "src/ui";

const sites = ref()
const loading = ref()
const checking = ref()

const groupedSites = computed(() => {
  const s = {}
  sites.value?.forEach(v => {
    if (v['health_check_enabled']) return

    if (!s[v.group]) {
      s[v.group] = []
    }

    s[v.group].push(v)
  })

  return s
})

const healthSites = computed(() => sites.value?.filter(v => v['health_check_enabled']) ?? [])

async function load() {
  try {
    loading.value = true
    const res = await api.get('/system/site')
    sites.value = res.data.data.sites
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

async function checkHealth() {
  checking.value = true

  for (let i = 0; i < healthSites.value.length; i++) {
    try {
      const res = await api.get(`/system/site/${healthSites.value[i].id}/health`)
      healthSites.value[i].health = res.data.data
    } catch (e) {
      ui.notifyUnexpectedError()
    }
  }

  checking.value = false
}

function openUrl(url) {
  window.open(url, '_blank');
}

function getSslExpiry(d) {
  const now = new Date()
  const d2 = new Date(d * 1000)
  const unit = 'days'

  return date.getDateDiff(d2, now, unit)
}

function getSslExpiryText(d) {
  const exp = getSslExpiry(d)

  if (exp <= 0) {
    return 'Expired'
  } else {
    return exp + ' days'
  }
}

function getSslExpiryColor(d) {
  const exp = getSslExpiry(d)

  if (exp > 20) {
    return 'positive'
  } else if (exp < 1) {
    return 'negative'
  } else if (exp < 5) {
    return 'deep-orange'
  } else if (exp < 10) {
    return 'orange'
  } else if (exp < 20) {
    return 'warning'
  }
}

load()
</script>

<style lang="scss" scoped>

</style>
