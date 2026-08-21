import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
)

const getMarkdownFiles = (directory) => fs
  .readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return getMarkdownFiles(absolutePath)
    if (!entry.name.endsWith('.md')) return []
    return path.relative(projectRoot, absolutePath).split(path.sep).join('/')
  })

const markdownFiles = [
  'AGENTS.md',
  'README.md',
  ...getMarkdownFiles(path.join(projectRoot, 'docs')).sort(),
]
const errors = []

const decode = (value, location) => {
  try {
    return decodeURIComponent(value)
  } catch {
    errors.push(`${location}: invalid URL encoding: ${value}`)
    return value
  }
}

const githubSlug = value => value
  .trim()
  .toLowerCase()
  .replace(/<[^>]*>/g, '')
  .replace(/[^\p{Letter}\p{Number}\s_-]/gu, '')
  .replace(/\s+/g, '-')

const getMarkdownHeadings = (content) => {
  const headings = new Set()
  const slugCounts = new Map()
  let fence = ''

  content.split(/\r?\n/).forEach((line) => {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/)
    if (fenceMatch) {
      fence = fence ? '' : fenceMatch[1][0]
      return
    }
    if (fence) return

    const headingMatch = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/)
    if (!headingMatch) return

    const baseSlug = githubSlug(headingMatch[1])
    const count = slugCounts.get(baseSlug) || 0
    slugCounts.set(baseSlug, count + 1)
    headings.add(count ? `${baseSlug}-${count}` : baseSlug)
  })

  return headings
}

const documents = new Map(markdownFiles.map((file) => {
  const absolutePath = path.join(projectRoot, file)
  const content = fs.readFileSync(absolutePath, 'utf8')
  return [file, {
    absolutePath,
    content,
    headings: getMarkdownHeadings(content),
  }]
}))

const markdownLinkPattern = /\[[^\]]*]\(([^)]+)\)/g
const literalPathPattern = /`((?:src|public|docs|scripts)\/[A-Za-z0-9_./-]+(?:\.[A-Za-z0-9_-]+)?)`/g
const yarnCommandPattern = /^\s*(?:\$\s*)?yarn(?:\s+([A-Za-z0-9:_-]+))?(?:\s|$)/
const ignoredYarnCommands = new Set(['add', 'config', 'install', 'remove', 'run', 'set', 'upgrade'])

for (const [file, document] of documents) {
  const lines = document.content.split(/\r?\n/)

  lines.forEach((line, index) => {
    const location = `${file}:${index + 1}`

    for (const match of line.matchAll(markdownLinkPattern)) {
      const rawTarget = match[1].trim().replace(/^<|>$/g, '')
      if (/^(?:https?:|mailto:|tel:)/i.test(rawTarget)) continue

      const hashIndex = rawTarget.indexOf('#')
      const rawPath = hashIndex >= 0 ? rawTarget.slice(0, hashIndex) : rawTarget
      const rawAnchor = hashIndex >= 0 ? rawTarget.slice(hashIndex + 1) : ''
      const decodedPath = decode(rawPath, location)
      const targetPath = decodedPath
        ? path.resolve(path.dirname(document.absolutePath), decodedPath)
        : document.absolutePath

      if (!fs.existsSync(targetPath)) {
        errors.push(`${location}: local link target not found: ${rawTarget}`)
        continue
      }

      if (!rawAnchor || path.extname(targetPath).toLowerCase() !== '.md') continue
      const relativeTarget = path.relative(projectRoot, targetPath)
      const targetDocument = documents.get(relativeTarget)
      const anchor = decode(rawAnchor, location).toLowerCase()
      if (!targetDocument?.headings.has(anchor)) {
        errors.push(`${location}: Markdown anchor not found: ${rawTarget}`)
      }
    }

    for (const match of line.matchAll(literalPathPattern)) {
      if (!fs.existsSync(path.join(projectRoot, match[1]))) {
        errors.push(`${location}: referenced project path not found: ${match[1]}`)
      }
    }

    const yarnMatch = line.match(yarnCommandPattern)
    const command = yarnMatch?.[1]
    if (
      command &&
      !ignoredYarnCommands.has(command) &&
      !Object.hasOwn(packageJson.scripts || {}, command)
    ) {
      errors.push(`${location}: package script not found: yarn ${command}`)
    }
  })
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(
  `Validated ${markdownFiles.length} Markdown files, local links, anchors, project paths, and yarn scripts.`,
)
