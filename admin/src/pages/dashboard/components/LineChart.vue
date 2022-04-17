<template>
  <v-chart class="chart" :option="options" />
</template>

<script>
export default {
  name: "LineChart",

  props: {
    title: {
      type: String,
      required: true
    },

    data: {
      type: Array,
      required: true
    },

    tooltipFormatter: {
      default: null
    }
  },

  data() {
    return {
    }
  },

  computed: {
    options() {
      let legend = [];
      let series = [];

      if (this.data.length && this.data[0][0]) {
        legend = this.data[0].map(v => v.name)
        series = this.data.map(s => ({ data: s.map(v => v.value), type: 'line' }))
      } else {
        legend = this.data.map(v => v.name)
        series = [{
          data: this.data.map(v => v.value), type: 'line'
        }]
      }

      const data = {
        title: {
          text: this.title,
          left: "center"
        },
        tooltip: {
          trigger: 'axis',
          formatter: this.tooltipFormatter
        },
       /* legend: {
          data: legend
        },*/
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          data: legend
        },
        yAxis: {
          type: 'value'
        },
        series: series
      }

      return data;
    }
  }
}
</script>

<style scoped>
.chart {
  height: 400px;
  width: 100%;
}
</style>
