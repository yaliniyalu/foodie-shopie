import {extend} from "quasar";
import { v4 as uuidv4 } from 'uuid';
import {ScreenSizes} from "src/js/builder-utils";

const defaultOpts = {
  widget: {
    id: null,
    name: null,
    template: null,
    query: null,
    options: null,
    is_active: true
  },

  swiperOptions: {
    breakpoints: {
      [ScreenSizes.xs]: {
        slidesPerView: 3,
        spaceBetween: 5
      },
      [ScreenSizes.sm]: {
        slidesPerView: 4,
        spaceBetween: 5
      },
      [ScreenSizes.md]: {
        slidesPerView: 8,
        spaceBetween: 5
      },
      [ScreenSizes.lg]: {
        slidesPerView: 8,
        spaceBetween: 5
      }
    },
    pagination: false,
    autoplay: false,
    loop: false
  },

  gridOptions: {
    grid: {
      [ScreenSizes.xs]: {rows: 2, cols: 2},
      [ScreenSizes.sm]: {rows: 2, cols: 2},
      [ScreenSizes.md]: {rows: 1, cols: 4},
      [ScreenSizes.lg]: {rows: 1, cols: 8},
    }
  },

  defaultOptions: {
    padding: ['none', 'none', 'none', 'none'],
    bordered: false
  },

  widgetItem: {
    style: 'rounded',
    position: "below",
    align: "center",
    show: [],
    overlay: false,
    title: {
      custom: false,
      size: '12',
      color: 'dark',
      style: [],
    },
    subtitle: {
      custom: false,
      size: '10',
      color: 'dark',
      style: [],
    }
  },

  widgetTitle: {
    text: null,

    size: '24',
    align: "center",
    style: [],
    color: 'dark',
    padding: ['sm', 'sm', 'none', 'none'],

    btn: {
      enable: false,
      label: "View All",
      to: null,
      textColor: "primary",
      bgColor: ""
    }
  },
}

export const DefaultModel = {
  WIDGET: 'widget',
  WIDGET_ITEM: 'widgetItem',
  WIDGET_ITEM_TITLE: 'widgetItemTitle',
  WIDGET_TITLE: 'widgetTitle',

  SWIPER_OPTIONS: "swiperOptions",
  GRID_OPTIONS: "gridOptions",
  DEFAULT_OPTIONS: "defaultOptions",

  getWidget(title, template, type) {
    const w = this.get(DefaultModel.WIDGET)

    w.id = uuidv4()
    w.name = title
    w.template = template
    w.type = type
    w.options = this.getOptions(template)
    w.list = []

    return w
  },

  getOptions(template) {
    let options = null;
    switch (template) {
      case 'swiper':
        options = this.get(DefaultModel.SWIPER_OPTIONS)
        break;

      case 'grid':
        options = this.get(DefaultModel.GRID_OPTIONS)
        break;

      case 'grid-3':
      case 'grid-swiper':
      case 'actions':
        options = this.get(DefaultModel.DEFAULT_OPTIONS)
        break;
    }

    options = extend(true, options, this.get(DefaultModel.DEFAULT_OPTIONS))

    options.item = this.get(DefaultModel.WIDGET_ITEM)
    options.title = this.get(DefaultModel.WIDGET_TITLE)
    options.screenSizes = ScreenSizes.getValues()
    options.customers = ['prime', 'normal', 'non-members']

    return options
  },

  get(id) {
    return extend(true, {}, defaultOpts[id])
  }
}

export const WidgetTemplates = {
  options: [
    {label: 'Swiper', value: 'swiper'},
    {label: 'Grid', value: 'grid'},
    {label: 'Grid 3', value: 'grid-3'},
    {label: 'Grid Swiper', value: 'grid-swiper'},
    {label: 'Action Buttons', value: 'actions'}
  ],

  getLabel(id) {
    return this.options.find(v => v.value === id)?.label
  },

  getOptions() {
    return this.options
  }
}

export const WidgetItemTypes = {
  options: [
      {label: 'Item', value: 'item', icon: 'shopping_bag'},
      {label: 'Category', value: 'category', icon: 'category'},
      {label: 'Banner', value: 'banner', icon: 'image'},
      {label: 'Other', value: 'other', icon: 'gamepad'}
  ],

  getLabel(id) {
    return this.options.find(v => v.value === id)?.label
  },

  getIcon(id) {
    return this.options.find(v => v.value === id)?.icon
  },

  getOptions() {
    return this.options
  }
}


export const TextStyleOpts = [
  {label: 'Bold', value: 'bold'},
  {label: 'Italic', value: 'italic'},
  {label: 'Underline', value: 'underline'},
  {label: 'Strike', value: 'strike'},
]

export const ColorOpts = [
  {label: 'Primary', value: 'primary'},
  {label: 'Secondary', value: 'secondary'},
  {label: 'Accent', value: 'accent'},
  {label: 'Info', value: 'info'},
  {label: 'Warning', value: 'warning'},
  {label: 'Positive', value: 'positive'},
  {label: 'Negative', value: 'negative'},
  {label: 'White', value: 'white'},
  {label: 'Dark', value: 'dark'},
  {label: 'Gery', value: 'grey'},
]

export const TextAlignOpts = [
  {label: 'Left', value: 'left'},
  {label: 'Right', value: 'right'},
  {label: 'Center', value: 'center'},
]
