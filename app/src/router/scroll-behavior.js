const scrollBehavior = function (to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition
  } else {
    if (to.hash) {
      return {
        selector: to.hash
      }
    }

    return { left: 0, top: 0}
  }
}

export default scrollBehavior;
