import {useStore} from "vuex";
import {onActivated, onMounted, ref, watch} from "vue";


export function useNavbar(options = '', titleVal = null) {
  const store = useStore()
  const title = ref(titleVal)

  watch(title, val => store.dispatch('app/setNavbar', {options, title: val}))

  onMounted(() => {
    create()

    onActivated(create)
  })

  function create() {
    store.dispatch('app/setNavbar', {options, title: title.value}).then()
  }

  function update(options, titleVal) {
    title.value = titleVal
    store.dispatch('app/setNavbar', {options, title: title.value}).then()
  }

  return {
    title,
    update
  }
}
