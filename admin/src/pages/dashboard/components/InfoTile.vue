<template>
  <q-card flat :class="['bg-' + color, 'text-white', 'info-tile']">
    <q-card-section class="flex justify-between">
      <div>
        <p class="text-bold text-uppercase">{{ title }}</p>
        <p class="text-h5">{{ formatNumberWithFloat(value) }}</p>
      </div>
      <div>
        <q-icon class="icon" :name="icon"/>
      </div>
      <div class="flex justify-between items-baseline full-width">
        <span :class="['diff', 'font-mono', 'q-ma-none', 'text-' + diffColor]" v-if="diff !== null">
          <span class="diff-icon">{{ diffIcon }}</span> {{ diff }}%
        </span>
        <router-link :to="to" class="text-grey flex items-center" v-if="to">VIEW</router-link>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import {computed} from "vue";
import {formatNumberWithFloat} from "src/js/utils";

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  prevValue: { type: [String, Number], required: false },
  icon: { type: String, required: true },
  to: { type: String },
  color: { type: String, required: true },
  inverse: { type: Boolean, default: false }
})

const diff = computed(() => {
  if (props.prevValue === undefined) {
    return null;
  }

  return percentChange(props.prevValue, props.value)
})

/*const diffIcon = computed(() => {
  return diff.value > 0 ? 'arrow_drop_up' : (diff.value < 0 ? 'arrow_drop_down' : null)
})*/

const diffIcon = computed(() => {
  return diff.value > 0 ? '▲' : (diff.value < 0 ? '▼' : null)
})

const diffColor = computed(() => {
  let UpColor = 'green'
  let DownColor = 'red'

  if (props.inverse) {
    UpColor = 'red'
    DownColor = 'green'
  }

  return diff.value >= 0 ? UpColor : (diff.value < 0 ? DownColor : null)
})

function percentChange(a, b) {
  let percent;
  if(b !== 0) {
    if(a !== 0) {
      percent = (b - a) / a * 100;
    } else {
      percent = b * 100;
    }
  } else {
    percent = - a * 100;
  }
  return Math.floor(percent);
}

/*function diffColor() {
  return props.diff.type >= 0 ? 'green' : 'red';
}

function diffIcon() {

}*/
</script>

<style lang="scss" scoped>
p {
  margin: 0;
}

.value {

}

.icon {
  font-size: 45px;
}

.info-tile {
  .icon {
    transition: transform 0.5s;
  }

  &:hover {
    .icon {
      transform: rotate(-20deg) scale(1.6);
    }
  }
}

.diff-icon {
  font-size: 18px;
}

a, a:visited {
  text-decoration: none;
  color: var(--q-primary);
}
</style>
