<template>
  <q-page>
    <q-card class="q-mb-md" flat>
      <q-card-section>
        <h6 class="q-ma-none">Contact Us</h6>
        <p class="q-mb-none text-grey">If you have any complaints or query please contact us using the form below.</p>
      </q-card-section>
      <q-card-section>
        <q-form @submit="submitForm" ref="formRef">
          <q-input
            v-model="enquiry.name"
            label="Name"
            outlined
            stack-label
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Name is required']"
          />
          <q-input
            v-model="enquiry.phone"
            label="Mobile Number"
            outlined
            stack-label
            lazy-rules
            mask="+91 (###) ### - ####"
            unmasked-value
            :rules="[ val => val && val.length > 0 || 'Phone number is required']"
          />

          <q-input
            type="textarea"
            autogrow
            label="Message"
            outlined
            stack-label
            v-model="enquiry.message"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Message is required']"
          />

          <div class="text-center">
            <q-btn type="submit" color="primary" unelevated label="Submit" :loading="submitting"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-card bordered flat v-if="settings">
      <q-card-section>
        <p class="q-ma-none text-grey">You can also contact us directly using below ways</p>
        <q-list>
          <q-item>
            <q-item-section>
              <div class="text-center text-bold text-h6">{{ settings['company.name'] }}</div>
              <div class="text-center">{{ settings['company.tagline'] }}</div>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple v-for="(contact, i) in settings['company.contact']" :key="i" @click="openLink(contact.url)">
            <q-item-section avatar>
              <q-icon color="primary" :name="contact.icon" />
            </q-item-section>

            <q-item-section>{{ contact.text }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import {computed, reactive, ref} from "vue";
import {useStore} from "vuex";
import ui from "src/ui";
import {useNavbar} from "src/composables/navbar";

const store = useStore()

const enquiry = reactive({
  name: '',
  phone: '',
  message: ''
})
const submitting = ref(false)
const formRef = ref()

const settings = computed(() => store.state.app.settings)

useNavbar('back search cart auth', "Contact")

async function submitForm(e) {
  e.preventDefault();

  submitting.value = true;
  try {
    await store.dispatch('app/postContactEnquiry', enquiry)
    formRef.value.reset();
    enquiry.message = enquiry.phone = enquiry.name = '';
    ui.notifySuccess("You query has been sent. We will contact you as soon as possible");
  } catch {
    ui.notifyError('Unable to send your query. Please try again.')
  }

  submitting.value = false;
}

function openLink(url) {
  window.open(url)
}
</script>

<style lang="scss" scoped>

</style>
