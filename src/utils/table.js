export const renderValue = (value) => {
  return value == null || value === '' || value === '0.000' ? '--' : value
}
