export const accountListParams = {
  page: 1,
  limit: 1000,
}

export const normalizeAccountIds = (value) => {
  const accountIds = Array.isArray(value)
    ? value
    : String(value || '').split(',')

  return [...new Set(
    accountIds
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0),
  )]
}
