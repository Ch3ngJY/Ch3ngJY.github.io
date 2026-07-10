import { mkdir, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'

const USER_ID = 212349
const POST_DIR = path.resolve('source/_posts')
const IMAGE_DIR = path.resolve('source/images/luogu')
const IMAGE_URL_PREFIX = '/images/luogu/'
const USER_ARTICLE_URL = `https://www.luogu.com/user/${USER_ID}/article`
const ARTICLE_URL_PREFIX = 'https://www.luogu.com/article/'
const execFileAsync = promisify(execFile)
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; HexoLuoguImporter/1.0)',
  Referer: `https://www.luogu.com/user/${USER_ID}/article?page=1`,
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const pad = (value) => String(value).padStart(2, '0')

function extractLentilleContext(html, url) {
  const match = html.match(/<script id="lentille-context" type="application\/json">([\s\S]*?)<\/script>/)
  if (!match) {
    throw new Error(`Cannot find lentille-context in ${url}`)
  }
  return JSON.parse(match[1])
}

function powerShellQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

async function fetchText(url) {
  const command = `
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$headers = @{
  'User-Agent' = ${powerShellQuote(HEADERS['User-Agent'])}
  'Referer' = ${powerShellQuote(HEADERS.Referer)}
}
$response = Invoke-WebRequest -Uri ${powerShellQuote(url)} -UseBasicParsing -TimeoutSec 30 -Headers $headers
[Console]::Write($response.Content)
`
  const encodedCommand = Buffer.from(command, 'utf16le').toString('base64')
  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodedCommand],
    { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 },
  )
  return stdout
}

async function fetchBuffer(url) {
  const response = await fetch(url, { headers: HEADERS })
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${url}: ${response.status} ${response.statusText}`)
  }
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') || '',
  }
}

function formatShanghaiTime(timestamp) {
  const date = new Date((timestamp + 8 * 60 * 60) * 1000)
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join('-') + ' ' + [
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
  ].join(':')
}

function yamlQuote(value) {
  return JSON.stringify(String(value))
}

function sanitizeFileName(title) {
  const sanitized = title
    .normalize('NFKC')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim()

  return sanitized || 'untitled'
}

function imageExtension(url, contentType) {
  const pathname = new URL(url).pathname
  const ext = path.extname(pathname).toLowerCase()
  if (/^\.(png|jpe?g|gif|webp|svg|bmp|avif)$/.test(ext)) return ext

  if (contentType.includes('png')) return '.png'
  if (contentType.includes('jpeg')) return '.jpg'
  if (contentType.includes('gif')) return '.gif'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('svg')) return '.svg'
  if (contentType.includes('bmp')) return '.bmp'
  if (contentType.includes('avif')) return '.avif'
  return '.png'
}

function normalizeImageUrl(url) {
  const trimmed = url.trim()
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  return trimmed
}

function collectImageUrls(markdown) {
  const urls = new Set()
  const markdownImagePattern = /!\[[^\]]*]\(\s*<?([^)\s>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g
  const htmlImagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi

  for (const match of markdown.matchAll(markdownImagePattern)) {
    if (/^https?:\/\//i.test(match[1]) || match[1].startsWith('//')) {
      urls.add(normalizeImageUrl(match[1]))
    }
  }

  for (const match of markdown.matchAll(htmlImagePattern)) {
    if (/^https?:\/\//i.test(match[1]) || match[1].startsWith('//')) {
      urls.add(normalizeImageUrl(match[1]))
    }
  }

  return [...urls]
}

function replaceImageUrls(markdown, replacements) {
  let result = markdown
  for (const [source, target] of replacements) {
    result = result.split(source).join(target)
    if (source.startsWith('https:')) {
      result = result.split(source.replace(/^https:/, '')).join(target)
    }
  }
  return result
}

function articleTags(article) {
  const tags = ['OI']
  const isTravelNote = article.categoryOld === '游记' || /游记|退役记|邮寄/.test(article.title)
  if (isTravelNote) tags.push('游记')
  return tags
}

function articlePermalink(article) {
  const datePath = formatShanghaiTime(article.time).slice(0, 10).replaceAll('-', '/')
  const knownSlugs = new Map([
    ['kyk6fj41', 'p6607-code-7-ant-solution'],
    ['bky8ysl7', 'p7542-coci-2009-2010-1-mali-solution'],
    ['t1ktedeo', 'p7635-coci-2010-2011-5-dvoniz-solution'],
  ])

  if (knownSlugs.has(article.lid)) {
    return `${datePath}/${knownSlugs.get(article.lid)}/`
  }

  if (/[#?]/.test(article.title)) {
    return `${datePath}/luogu-${article.lid}/`
  }

  return null
}

function frontMatter(article) {
  const tags = articleTags(article)
  const permalink = articlePermalink(article)
  return [
    '---',
    `title: ${yamlQuote(article.title)}`,
    `date: ${formatShanghaiTime(article.time)}`,
    ...(permalink ? [`permalink: ${permalink}`] : []),
    'categories:',
    '  - OI',
    'tags:',
    ...tags.map((tag) => `  - ${tag}`),
    `luogu_lid: ${yamlQuote(article.lid)}`,
    `source_url: ${yamlQuote(`${ARTICLE_URL_PREFIX}${article.lid}`)}`,
    '---',
    '',
  ].join('\n')
}

async function fetchArticleListPage(page) {
  const url = `${USER_ARTICLE_URL}?page=${page}`
  const html = await fetchText(url)
  const context = extractLentilleContext(html, url)
  return context.data.articles
}

async function fetchArticle(lid) {
  const url = `${ARTICLE_URL_PREFIX}${lid}`
  const html = await fetchText(url)
  const context = extractLentilleContext(html, url)
  return context.data.article
}

async function downloadArticleImages(article) {
  const urls = collectImageUrls(article.content)
  const replacements = new Map()

  for (const [index, sourceUrl] of urls.entries()) {
    try {
      const { buffer, contentType } = await fetchBuffer(sourceUrl)
      const ext = imageExtension(sourceUrl, contentType)
      const fileName = `${article.lid}-${pad(index + 1)}${ext}`
      const outputPath = path.join(IMAGE_DIR, fileName)
      const publicPath = `${IMAGE_URL_PREFIX}${fileName}`

      await writeFile(outputPath, buffer)
      replacements.set(sourceUrl, publicPath)
      console.log(`  image ${index + 1}/${urls.length}: ${sourceUrl} -> ${publicPath}`)
      await sleep(120)
    } catch (error) {
      console.warn(`  image failed: ${sourceUrl}`)
      console.warn(`    ${error.message}`)
    }
  }

  return replaceImageUrls(article.content, replacements)
}

async function main() {
  await mkdir(POST_DIR, { recursive: true })
  await mkdir(IMAGE_DIR, { recursive: true })

  const firstPage = await fetchArticleListPage(1)
  const pageCount = Math.ceil(firstPage.count / firstPage.perPage)
  const summaries = [...firstPage.result]

  for (let page = 2; page <= pageCount; page += 1) {
    await sleep(250)
    const articlePage = await fetchArticleListPage(page)
    summaries.push(...articlePage.result)
  }

  console.log(`Found ${summaries.length} articles across ${pageCount} pages.`)

  const seenLids = new Set()
  let imported = 0

  for (const summary of summaries) {
    if (seenLids.has(summary.lid)) continue
    seenLids.add(summary.lid)

    await sleep(250)
    const article = await fetchArticle(summary.lid)
    const content = await downloadArticleImages(article)
    const fileName = `${sanitizeFileName(article.title)}.md`
    const outputPath = path.join(POST_DIR, fileName)
    const markdown = `${frontMatter(article)}${content.trim()}\n`

    await writeFile(outputPath, markdown, 'utf8')
    imported += 1
    console.log(`${imported}. ${article.title} -> source/_posts/${fileName}`)
  }

  console.log(`Imported ${imported} articles.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
