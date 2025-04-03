<template>
  <div class="summary-card">
    <p class="label">{{ title }}</p>
    <p class="value" :class="colorClass">${{ value.toFixed(2) }}</p>
  </div>
</template>

<script>
export default {
  props: ['title', 'value', 'color'], 
  colorClass() {
    return this.color === 'green' ? 'green' : this.color === 'red' ? 'red' : ''
  }
}
</script>


