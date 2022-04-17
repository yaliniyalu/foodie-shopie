

export function parseColorStyle(color) {
  if (!color) return ''
  return color.startsWith('#') ? color : `var(--q-${color})`
}

export function parseTextStyleClass(styles) {
  return styles.map(v => 'vs-text-' + v)
}

export function parsePaddingClass(padding) {
  const pad = ['l', 'r', 't', 'b']
  return padding.map((v, i) => 'q-p' + pad[i] + '-' + v)
}

export const ScreenSizes = {
  xs: '0',
  sm: '640',
  md: '768',
  lg: '1024',
  xl: '',

  getValues() {
    return [this.xs, this.sm, this.md, this.lg]
  }
}
