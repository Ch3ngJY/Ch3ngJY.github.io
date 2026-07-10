const mathStore = new Map()

function protectMath(content, snippets) {
  return content.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g).map((part) => {
    if (part.startsWith('```') || part.startsWith('~~~')) return part

    return part
      .replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
        const index = snippets.push({ type: 'display', value: match }) - 1
        return `\n\n<div class="math-display">\n@@CLAUDIA_MATH_${index}@@\n</div>\n\n`
      })
      .replace(/(^|[^\\$])\$([^\n$]+?[^\\])\$(?!\$)/g, (match, prefix, math) => {
        const index = snippets.push({ type: 'inline', value: `$${math}$` }) - 1
        return `${prefix}@@CLAUDIA_MATH_${index}@@`
      })
  }).join('')
}

function restoreMath(content, snippets) {
  return content.replace(/@@CLAUDIA_MATH_(\d+)@@/g, (match, index) => {
    const snippet = snippets[Number(index)]
    return snippet ? snippet.value : match
  })
}

hexo.extend.filter.register('before_post_render', function (data) {
  const snippets = []
  const key = data.source || data.path || data.slug || data.title

  data.content = protectMath(data.content || '', snippets)
  data.__claudiaMathSnippets = snippets
  if (key) mathStore.set(key, snippets)

  return data
})

hexo.extend.filter.register('after_post_render', function (data) {
  const key = data.source || data.path || data.slug || data.title
  const snippets = data.__claudiaMathSnippets || mathStore.get(key) || []

  data.content = restoreMath(data.content || '', snippets)
  if (key) mathStore.delete(key)

  return data
})
