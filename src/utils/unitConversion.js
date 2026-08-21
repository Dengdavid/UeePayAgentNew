export const setSize = (value, defaultValue) => {
  const _value = value || defaultValue
  if (_value) {
    if (typeof _value === 'string') return _value
    if (typeof _value === 'number') return `${_value}px`
  }
  return null
}
