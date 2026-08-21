import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const projectRoot = process.cwd()
const countries = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src/config/countries.json'), 'utf8'),
)
const localeConfigUrl = pathToFileURL(
  path.join(projectRoot, 'src/locales/set.js'),
)
const localeConfig = await import(localeConfigUrl)
const enabledLocales = new Set(localeConfig.setData.map(item => item.value))
const supportedRegions = new Set([
  'Asia',
  'Europe',
  'Africa',
  'America',
  'Pacific',
  'Indian',
  'Atlantic',
  'Antarctica',
])
const requiredFields = [
  'code',
  'alpha3',
  'name',
  'name_key',
  'flag',
  'language',
  'language_name',
  'timezone',
  'region',
  'phoneCode',
]

const errors = []
const codes = new Set()
const alpha3Codes = new Set()
const nameKeys = new Set()

for (const country of countries) {
  const label = country.code || 'unknown'
  requiredFields.forEach((field) => {
    if (typeof country[field] !== 'string' || !country[field].trim()) {
      errors.push(`${label}: missing ${field}`)
    }
  })

  if (!/^[A-Z]{2}$/.test(country.code)) errors.push(`${label}: invalid code`)
  if (!/^[A-Z]{3}$/.test(country.alpha3)) errors.push(`${label}: invalid alpha3`)
  if (codes.has(country.code)) errors.push(`${label}: duplicate code`)
  if (alpha3Codes.has(country.alpha3)) errors.push(`${label}: duplicate alpha3`)
  if (nameKeys.has(country.name_key)) errors.push(`${label}: duplicate name_key`)
  codes.add(country.code)
  alpha3Codes.add(country.alpha3)
  nameKeys.add(country.name_key)

  try {
    new Intl.Locale(country.language)
  } catch {
    errors.push(`${label}: invalid language ${country.language}`)
  }
  if (!supportedRegions.has(country.region)) {
    errors.push(`${label}: unsupported region ${country.region}`)
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: country.timezone }).format()
  } catch {
    errors.push(`${label}: invalid timezone ${country.timezone}`)
  }

  const expectedFlag = `/images/state/${country.code.toLowerCase()}.png`
  if (country.flag !== expectedFlag) errors.push(`${label}: flag path must be ${expectedFlag}`)
  if (!fs.existsSync(path.join(projectRoot, 'public', country.flag))) {
    errors.push(`${label}: flag file not found`)
  }
}

if (countries.length !== 249) {
  errors.push(`expected 249 ISO countries and territories, received ${countries.length}`)
}

for (const locale of enabledLocales) {
  const moduleUrl = pathToFileURL(
    path.join(projectRoot, `src/locales/lang/${locale}/state.js`),
  )
  const state = (await import(moduleUrl)).default
  countries.forEach((country) => {
    const key = country.name_key.replace('state.', '')
    if (!state[key]) errors.push(`${country.code}: missing ${country.name_key} in ${locale}`)
  })
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${countries.length} countries and territories.`)
