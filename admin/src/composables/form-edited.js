import {onBeforeUnmount, onMounted} from "vue";
import {onBeforeRouteLeave} from "vue-router";
import ui from "src/ui";
import {Dialog} from "quasar";

function prompt(next) {
  Dialog.create({
    title: "Unsaved Changes",
    message: "There are some unsaved changes. Do you want to leave page?",
    color: "warning",
    persistent: true,
    ok: {
      flat: true,
      label: 'Stay on page'
    },
    cancel: {
      unelevated: true,
      label: "Leave page"
    }
  }).onOk(() => {

  }).onCancel(() => {
    next()
  })
}

export function useFormEdited(isChanged) {
  onMounted(() => window.addEventListener('beforeunload', formEdited))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', formEdited))

  onBeforeRouteLeave((to, from, next) => {
    if (isChanged.value) {
      prompt(next)
    } else {
      next();
    }
  })

  function formEdited(e) {
    if (!isChanged.value) {
      return;
    }

    e.preventDefault();
    e.returnValue = '';
    return ''
  }
}
