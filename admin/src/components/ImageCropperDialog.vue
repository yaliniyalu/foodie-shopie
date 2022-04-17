<template>
  <q-dialog ref="dialogRef">
    <q-card style="width: 60%" v-if="url">
      <q-card-section>
        <vue-cropper
          ref="cropperRef"
          :src="url"
          alt="Source Image"
          :aspectRatio="aspectRatio"

          v-if="edit"
        >
        </vue-cropper>
        <img style="width: 100%" :src="editedUrl" alt="img" v-if="!edit"/>
      </q-card-section>

      <q-card-section v-if="edit">
        <div class="q-gutter-sm flex justify-center">
          <q-btn-group flat>
            <q-btn unelevated color="accent" icon="undo" @click="cropperRef.rotate(-45)"/>
            <q-btn unelevated color="accent" icon="redo" @click="cropperRef.rotate(+45)"/>
          </q-btn-group>
          <q-btn-group flat>
            <q-btn unelevated color="accent" icon="swap_vert" @click="cropperRef.scaleY(scale.y = -scale.y)"/>
            <q-btn unelevated color="accent" icon="swap_horiz" @click="cropperRef.scaleX(scale.x = -scale.x)"/>
          </q-btn-group>
          <q-btn-group flat>
            <q-btn unelevated color="accent" label="3:1" @click="cropperRef.setAspectRatio(3)"/>
            <q-btn unelevated color="accent" label="1:1" @click="cropperRef.setAspectRatio(1)"/>
            <q-btn unelevated color="accent" label="Free" @click="cropperRef.setAspectRatio(null)"/>
          </q-btn-group>
          <q-btn-group flat>
            <q-btn unelevated color="info" label="Clear" @click="edit = false"/>
            <q-btn unelevated color="info" label="Apply" @click="applyImage"/>
          </q-btn-group>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Edit" color="accent" @click="performEdit()" v-if="!edit"/>
        <q-btn flat label="Cancel" color="secondary" @click="onDialogCancel"/>
        <q-btn label="Save" color="primary" @click="saveImage" :disable="edit" :loading="loading"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {nextTick, reactive, ref} from 'vue';
import {useDialogPluginComponent} from "quasar";
import ui from "src/ui";
import {api} from "boot/axios";
import axios from "axios";
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  aspectRatio: {
    type: [String, Number],
    default: 1
  }
})

const cropperRef = ref()
const loading = ref()
const edit = ref()
const editedUrl = ref(props.url)

const scale = reactive({x: 1, y: 1})
const cropData = ref()

async function saveImage() {
  loading.value = true

  const blob = await axios.get(editedUrl.value, { responseType: 'blob' })
    .then(res => new File([res.data], "file.png"));

  let data = new FormData();
  data.append('file', blob, "file.png")
  api.post(`upload`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => {
    onDialogOK(res.data.data)
  }).catch(e => {
    ui.notifyError(e.response.data.message)
  }).finally(() => {
    loading.value = false
  });
}

function applyImage() {
  cropperRef.value
    .getCroppedCanvas()
    .toBlob((blob) => {
      cropData.value = cropperRef.value.getData()
      editedUrl.value = URL.createObjectURL(blob)
      edit.value = false
    }, 'image/png');
}

function performEdit() {
  edit.value = true

  if (cropData.value) {
    nextTick(() => cropperRef.value.setData(cropData.value))
  }
}
</script>

<style lang="scss" scoped>
</style>
