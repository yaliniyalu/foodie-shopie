<template>
  <div class="relative-position">
    <div :class="`image-preview preview-${props.layout}`" v-if="modelValue || defaultSrc">
      <q-img class="image" :src="imageSrc" :alt="alt" @error="loadingError = true"/>
      <div class="overlay" @click="openImage" v-if="!readonly">
        <span>Change</span>
        <span class="btn-delete" v-if="!required && modelValue"><q-btn color="negative" flat round icon="delete" @click.stop="onFileDelete"/></span>
      </div>
    </div>
    <div v-if="!modelValue && !readonly && !defaultSrc">
      <q-btn color="secondary" flat label="Upload Image" @click="openImage"/>
    </div>
    <q-inner-loading :showing="loading">
      <q-spinner-tail color="primary" size="50px"/>
    </q-inner-loading>
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, ref, toRefs, watch} from "vue";
import ImageCropperDialog from "components/ImageCropperDialog";
import {useQuasar} from "quasar";
import ui from "src/ui";
const props = defineProps({
  src: String,
  alt: {
    type: String,
    default: ""
  },
  size: {
    type: String,
    default: "250x250"
  },
  readonly: {
    type: Boolean,
    default: false
  },
  layout: String,
  aspectRatio: {
    type: Number,
    default: 1
  },
  required: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
  },
  loading: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['change', 'delete', 'update:modelValue'])
const { src, readonly, alt } = toRefs(props);
const $q = useQuasar()

const defaultSrc = `https://placehold.jp/${props.size}.png?text=${props.alt}`
const errorSrc = `https://placehold.jp/cc9999/993333/${props.size}.png?text=error`

function openImage() {
  input.click()
}

onBeforeUnmount(() => {
  input.removeEventListener("change", onFileChange);
})

const input = document.createElement('input');
input.type = 'file';
input.accept = "image/*";
input.addEventListener("change", onFileChange);

watch(src, () => loadingError.value = false)
watch(() => props.modelValue, () => loadingError.value = false)

const loadingError = ref(false)
const imageSrc = computed(() => loadingError.value ? errorSrc : (props.modelValue || props.src || defaultSrc))

function onFileChange() {
  const url = window.URL.createObjectURL(this.files[0])
  $q.dialog({
    component: ImageCropperDialog,
    componentProps: {
      url,
      aspectRatio: props.aspectRatio
    }
  }).onOk((file) => {
    emit('change', file);
    emit('update:modelValue', file.path);
  })
}

function onFileDelete() {
  emit('delete')
  emit('update:modelValue', null);
}

</script>

<style lang="scss" scoped>
.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  &.preview-round {
    .image, .overlay {
      border-radius: 50%;
    }
  }
  &.preview-rounded {
    .image, .overlay {
      border-radius: 5px;
    }
  }
  .image {
    width: 100%;
    height: 100%;
    display: block;
  }
  .overlay {
    width: 100%;
    height: 100%;
    background: #000000ab;
    color: var(--q-primary);
    position: absolute;
    top: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s;
    span {
      font-weight: bold;
    }

    .btn-delete {
      position: absolute;
      right: 5px;
      top: 5px;
    }
  }
  &:hover .overlay {
    visibility: visible;
    opacity: 1;
  }
}
</style>
