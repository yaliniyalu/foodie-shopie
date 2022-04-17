<template>
<div :class="['badge', 'text-' + color]">
  <div :class="['label', 'bg-' + color]">{{ label }}</div>
  <div :class="['value', 'text-' + color]">{{ value }}</div>
</div>
</template>

<script setup>
defineProps({
  color: { type: String, default: 'primary' },
  label: { type: String, required: true },
  value: { type: String, required: true }
})
</script>

<style lang="scss" scoped>
.badge {
  border-radius: 5px;
  display: flex;
  font-size: 12px;
  font-weight: bold;
  position: relative;
  width: fit-content;

  &::before {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: inherit;

    border: 1px solid currentColor;
  }

  .label {
    padding: 1px 6px;
    color: #fff;
    border-radius: 5px 0 0 5px;
  }

  .value {
    padding: 1px 6px;
    background-color: #fff;
  }
}
</style>
