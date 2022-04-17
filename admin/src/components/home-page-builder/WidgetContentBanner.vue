<template>
  <div class="flex q-pa-md q-gutter-md">
    <div class="content" v-for="(i, index) in images">
      <img :src="i.image" alt="">
      <div class="overlay" v-if="i.title || i.subtitle">
        <div>{{ i.title }}</div>
        <div>{{ i.subtitle }}</div>
      </div>
      <div class="controls">
        <q-btn class="btn-edit" flat round color="primary" icon="edit" @click="editContent(index)"/>
        <q-btn class="btn-delete" flat round color="negative" icon="delete" @click="deleteContent(index)"/>
      </div>
    </div>

    <div class="btn-upload" @click="addContent">
      <div class="content">
        <q-icon size="16px" name="add"/>
        <div>Upload</div>
      </div>
    </div>

    <q-dialog v-model="dialog">
      <q-card style="width: 60%">
        <q-card-section class="row q-col-gutter-md">
          <div class="col">
            <ImagePreview v-model="content.image" alt="image"/>
          </div>

          <div class="col q-gutter-md">
            <q-input outlined stack-label label="Title" v-model="content.title"/>
            <q-input outlined stack-label label="Subtitle" v-model="content.subtitle"/>

            <div>
              <q-radio val="item" label="Item" v-model="content.type"/>
              <q-radio val="category" label="Category" v-model="content.type"/>
              <q-radio val="other" label="Other" v-model="content.type"/>
            </div>

            <SelectItem outlined stack-label label="Item" emit-value v-model="content.item" v-if="content.type === 'item'"/>
            <SelectCategory outlined stack-label label="Category" v-model="content.category" emit-value v-if="content.type === 'category'"/>
            <q-input outlined stack-label label="Link" v-model="content.link" v-if="content.type === 'other'"/>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right">
          <q-btn flat color="primary" label="cancel" v-close-popup/>
          <q-btn unelevated color="primary" label="Save" @click="saveContent"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import {reactive, ref, toRef, watch} from "vue";
import ImagePreview from "components/ImagePreview";
import SelectItem from "components/select/SelectItem";
import SelectCategory from "components/select/SelectCategory";
import ui from "src/ui";

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const images = toRef(props, 'modelValue')
const dialog = ref()
const selectedIndex = ref(null)

const content = reactive({
  image: null,
  title: null,
  subtitle: null,
  type: 'other',
  item: null,
  category: null,
  link: null
})
resetContent()

const linkType= toRef(content, 'type')

watch(linkType, (val, prev) => {
  if (val !== prev) {
    if (prev === 'other') {
      content.link = null
    } else if (prev === 'item') {
      content.item = null
    } else if (prev === 'category') {
      content.category = null
    }
  }
})

function resetContent(w = {}) {
  selectedIndex.value = null
  content.image = w.image ?? null
  content.title = w.title ?? null
  content.subtitle = w.subtitle ?? null
  content.type = w.type ?? 'other'
  content.link = w.link ?? null
  content.item = w.item ?? null
  content.category = w.category ?? null
}

function addContent() {
  resetContent()
  dialog.value = true
}

function saveContent() {
  if (!content.image) {
    ui.notifyError("Image is required")
    return
  }

  const c = {...content, item_id: content.item?.value, category_id: content.category?.value}
  if (selectedIndex.value !== null) {
    images.value[selectedIndex.value] = c
  } else {
    images.value.push(c)
  }

  dialog.value = false
  resetContent()
}

function deleteContent(index) {
  images.value.splice(index, 1);
}

function editContent(index) {
  resetContent(images.value[index])
  selectedIndex.value = index
  dialog.value = true
}

</script>

<style lang="scss" scoped>
.btn-upload {
  background: $grey;
  border: 1px solid $grey-1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  cursor: pointer;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $grey-2;
    font-size: 16px;
  }
}

.content {
  width: auto;
  height: 150px;
  display: flex;
  position: relative;

  img {
    width: auto;
    height: 100%;
  }

  .overlay, .controls {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .overlay {
    background-color: #0000009c;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .controls {
    display: none;
  }

  &:hover .controls {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
}
</style>
