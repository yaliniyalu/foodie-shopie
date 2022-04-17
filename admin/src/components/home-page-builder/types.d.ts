
enum WidgetItemStyle {
  Rounded = 'rounded',
  Round = 'round',
  Square = 'square'
}

enum WidgetItemPosition {
  Below = below,
  After = after,
  Before = before,
  Top = top,
  Bottom = bottom,
  Middle = middle
}

enum WidgetItemAlignment {
  Left = left,
  Right = right,
  Center = center
}

enum WidgetItemDefaultContent {
  Title = title,
  Subtitle = subtitle,
  Offer = offer,
  AddToCart = add-to-cart,
}

interface IWidgetItemText {
  custom: Boolean
  size: Number
  color: String
  style: Array<String>
}

interface IWidgetItem {
  style: WidgetItemStyle
  position: WidgetItemPosition
  align: WidgetItemAlignment
  show: Array<WidgetItemDefaultContent>
  overlay: Boolean
  title: IWidgetItemText
  subtitle: IWidgetItemText
}

interface IWidgetTitleBtn {
  enable: boolean
  label: string
  to: string
  textColor: string
  bgColor: string
}

interface IWidgetTitle {
  text: string

  size: number,
  align: WidgetItemAlignment,
  style: Array<string>,
  color: string,
  padding: Array<string>,

  btn: IWidgetTitleBtn
}

interface IWidgetOptions {
  item: IWidgetItem
  title: IWidgetTitle
  padding: Array<string>
  bordered: boolean

  breakpoints: Array<object> | null,
  pagination: boolean
  autoplay: boolean
  loop: boolean

  grid: Array<object> | null

  customers: Array<string>
  screenSizes: Array<string>
}

interface IWidget {
  id: string
  name: string
  template: string
  query: string
  type: string
  options: IWidgetOptions
  is_active: boolean
  list: Array<object>
}
