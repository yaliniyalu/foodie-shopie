<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Tasks</div>
          </div>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <q-markup-table flat bordered separator="cell">
          <thead>
          <tr>
            <th>Task</th>
            <th>Executed On</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="task in tasks">
            <td class="text-bold">{{ task.name }}</td>
            <td>
              {{ task.last_executed ? timeAgo(task.last_executed) : 'none' }}

              <q-tooltip v-if="task.last_executed">
                {{ humanDateTime(task.last_executed) }}
              </q-tooltip>
            </td>
            <td>
              <StatusBadge :options="TaskStatus" :value="task.last_status" v-if="task.last_status"/>
            </td>
            <td><q-btn unelevated label="Execute" color="primary" @click="execute(task)"/></td>
          </tr>
          </tbody>
        </q-markup-table>

        <q-inner-loading :showing="loading">
          <q-spinner-bars size="50" color="primary"/>
        </q-inner-loading>

        <q-inner-loading :showing="executing">
          <q-spinner-pie size="50" color="primary"/>
        </q-inner-loading>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import {ref} from "vue";
import {api} from "boot/axios";
import {humanDateTime, timeAgo} from "src/js/utils";
import ui from "src/ui";
import StatusBadge from "components/badge/StatusBadge";

const tasks = ref()
const loading = ref()
const executing = ref()

async function load() {
  try {
    loading.value = true
    const res = await api.get('/task?select=id,name,last_executed,last_status')
    tasks.value = res.data.data.tasks
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

async function execute(task) {
  try {
    executing.value = true
    await api.post(`/task/${task.id}/execute`)
    await load()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    executing.value = false
  }
}

const TaskStatus = [
  { value: 'Success', label: 'Success', color: 'positive' },
  { value: 'Failure', label: 'Failure', color: 'negative' }
]

load()
</script>

<style lang="scss" scoped>

</style>
