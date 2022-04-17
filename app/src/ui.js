import {Notify, Dialog, Loading} from 'quasar'

export default {
  notify(message) {
    Notify.create(message)
  },

  toast(message, isNegative) {
    Notify.create({
      color: isNegative ? 'red-4' : 'green-4',
      timeout: 1500,
      message,
      icon: isNegative ? 'close' : 'check'
    })
  },

  notifyUnexpectedError() {
    Notify.create({
      color: 'red-4',
      icon: 'fas fa-exclamation-triangle',
      message: 'Sorry, Unexpected Error Occurred.'
    });
  },

  notifyError(message) {
    Notify.create({
      color: 'red-4',
      icon: 'fas fa-exclamation-triangle',
      message: message
    });
  },

  notifySuccess(message) {
    Notify.create({
      color: 'green-4',
      icon: 'fas fa-check-circle',
      message: message
    });
  },

  alert(message, title = '') {
    let obj = {
      message: message
    };

    if (title) obj.title = title;

    return new Promise(((resolve, reject) => {
      Dialog.create(obj)
        .onOk(() => resolve())
        .onDismiss(() => reject())
    }));
  },

  confirm(obj) {
    return new Promise(((resolve, reject) => {
      Dialog.create(obj)
        .onOk(() => resolve())
        .onCancel(() => reject())
        .onDismiss(() => reject())
    }));
  },

  askYesNo(message, title = '', onOk = null) {
    let obj = {
      title: title,
      message: message,
      ok: { label: 'yes', flat: true, unelevated: true },
      cancel: { label: 'no', flat: true, unelevated: true }
    };

    return new Promise(((resolve, reject) => {
      Dialog.create(obj)
        .onOk(() => resolve())
        .onCancel(() => reject())
        .onDismiss(() => reject())
    }));
  },

  showLoader(message) {
    Loading.show({
      message: message
    })
  },

  hideLoader() {
    Loading.hide();
  }
}

