/*
export function someGetter (state) {
}
*/

import {getAssetsUrl, parseItem} from "src/js/utils";

export function getDashboard(state, getter, root) {
  if (!state.dashboard) return null

  return state.dashboard.map(item => {
    item = {...item}

    item.list = item.list?.map(v => {
      v = {...v}
      if (v['options']) v['options'] = JSON.parse(v['options'])
      return v;
    })
    return item;
  });
}

export function getCategories(state) {
  return state.categories.map(v => {
    v.image = getAssetsUrl(v.image, 'category')
    v.banner_image = getAssetsUrl(v.banner_image, 'category')
  })
}
