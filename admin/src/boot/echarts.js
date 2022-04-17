import { boot } from 'quasar/wrappers'
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import {CanvasRenderer} from 'echarts/renderers'

import {
  LineChart, PieChart
} from 'echarts/charts'

import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(( { app } ) => {
  use([
    CanvasRenderer,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    ToolboxComponent,

    LineChart,
    PieChart
  ]);

  app.component('v-chart', ECharts)
})
