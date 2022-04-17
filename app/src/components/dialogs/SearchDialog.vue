<template>
  <q-dialog
    ref="dialogRef" @hide="onDialogHide"
    persistent
    maximized
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card>
      <q-card-section>
        <q-input type="search" outlined stack-label rounded dense autofocus
                 v-model="query" :model-value="query"
                 color="primary"
                 placeholder="What are you looking for?"
                 @keydown.enter.prevent="search(query)">

          <template v-slot:append>
            <q-icon color="primary" name="search" />
          </template>
          <template v-slot:prepend>
            <q-btn color="primary" dense icon="arrow_back" round flat v-close-popup />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list padding class="q-pt-none">
          <template v-if="query">
            <q-item clickable v-for="s in suggestions" @click="openItemDetails(s)" :dense="!s.promo_tag">
              <q-item-section>
                <q-item-label><span v-html="highlightWord(s.name, query)"></span></q-item-label>
                <q-item-label caption v-if="s.promo_tag">{{ s.promo_tag }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <template v-if="!query">
            <q-item clickable v-for="s in savedSuggestions" @click="search(s)" dense>
              <q-item-section>
                <q-item-label><span>{{s}}</span></q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label><q-btn flat color="grey" dense round icon="cancel" @click.stop="removeSuggestion(s)"/></q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <p v-if="(query && !suggestions.length) || (!query && !savedSuggestions.length)" class="text-center text-grey">No suggestions</p>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {LocalStorage, throttle, useDialogPluginComponent} from 'quasar'
import {computed, ref, watch} from "vue";
import {api} from "boot/axios";
import {useRouter} from "vue-router";

defineEmits(useDialogPluginComponent.emits)
const { dialogRef, onDialogHide } = useDialogPluginComponent()

const router = useRouter()

const query = ref()
const suggestions = ref([])

watch(query, _ => throttlesSuggestions())
const throttlesSuggestions = throttle(searchSuggestions, 600)

const savedSuggestions = ref([])
savedSuggestions.value = LocalStorage.getItem('saved-searches') ?? [];

async function searchSuggestions() {
  if (query.value.length <= 0) {
    return
  }

  const q = []
  q.push(`filter[name][ct]=${query.value}`)
  q.push('filter[isActive]=true')
  q.push(`select=${['id', 'name']}`)
  q.push('sortByAsc=name')
  q.push(`limit=25`)
  q.push(`page=1`)

  const res = await api.get('item?' + q.join('&'))
  suggestions.value = res.data.data.items
}

function search(q) {
  if (q) {
    saveSuggestion(q)
    router.push(`/items?q=${q}`)
  }
  dialogRef.value.hide()
}

function openItemDetails(i) {
  saveSuggestion(i.name)
  router.push(`/item/${i.id}`)
  dialogRef.value.hide()
}

function highlightWord(word, search) {
  return word.replace(new RegExp(search, "ig"), `<span class="text-bold">${search}</span>`);
}

function saveSuggestion(q) {
  if (!savedSuggestions.value.includes(q)) {
    savedSuggestions.value.unshift(q)
  }

  if (savedSuggestions.value.length > 5) {
    savedSuggestions.value.pop()
  }

  LocalStorage.set('saved-searches', savedSuggestions.value)
}

function removeSuggestion(q) {
  savedSuggestions.value = savedSuggestions.value.filter(v => v !== q)
  LocalStorage.set('saved-searches', savedSuggestions.value)
}
</script>

<style lang="scss" scoped>

</style>
