import {onBeforeUnmount} from "vue";


export function useFileUpload() {
  function openDialog() {
    fileInput.click()
  }

  let fnOnUpload = () => {}
  const onUpload = (fn) => fnOnUpload = fn

  function upload(e) {
    fnOnUpload.call(this, e)
  }

  onBeforeUnmount(() => {
    fileInput.removeEventListener("change", upload);
  })

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.addEventListener("change", upload);

  return {
    openDialog,
    onUpload
  }
}
