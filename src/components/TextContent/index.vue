<template>
  <iframe
    v-if="data"
    ref="iframe"
    class="text-content-frame"
    :class="{ 'is-hidden': isHidden }"
    :srcdoc="data"
    :title="title"
    @load="handleLoad"
  />
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Content',
  },
})

const iframe = ref(null)
const isHidden = ref(true)
let resizeObserver = null
let mutationObserver = null
let resizeFrame = 0

const clearObservers = () => {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  resizeObserver = null
  mutationObserver = null

  if (resizeFrame) {
    window.cancelAnimationFrame(resizeFrame)
    resizeFrame = 0
  }
}

const updateHeight = () => {
  resizeFrame = 0
  const iframeRef = iframe.value
  const doc = iframeRef?.contentDocument || iframeRef?.contentWindow?.document
  if (!iframeRef || !doc?.body || !doc.documentElement) return

  // 先清除旧高度，避免内容变短时 documentElement 被旧视口高度撑住。
  iframeRef.style.height = '0px'
  const height = Math.max(
    doc.body.scrollHeight,
    doc.body.offsetHeight,
    doc.documentElement.scrollHeight,
    doc.documentElement.offsetHeight
  )
  iframeRef.style.height = `${Math.ceil(height)}px`
  isHidden.value = false
}

const scheduleHeightUpdate = () => {
  if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
  resizeFrame = window.requestAnimationFrame(updateHeight)
}

const removeNbspParagraphs = (doc) => {
  doc.querySelectorAll('p').forEach((paragraph) => {
    const text = paragraph.textContent?.replace(/\u00a0/g, '').trim()
    if (!paragraph.children.length && !text) paragraph.remove()
  })
}

const prepareDocument = (doc) => {
  removeNbspParagraphs(doc)

  let style = doc.getElementById('text-content-base-style')
  if (!style) {
    style = doc.createElement('style')
    style.id = 'text-content-base-style'
    doc.head.appendChild(style)
  }

  style.textContent = `
    html, body {
      min-height: 0;
      margin: 0;
      padding: 0;
    }
    body {
      overflow: hidden;
      font-size: 14px;
      line-height: 1.68;
    }
    img, video, iframe {
      max-width: 100%;
    }
    img, video {
      height: auto;
    }
  `

  doc.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
  })
}

const observeDocument = (iframeRef, doc) => {
  const iframeWindow = iframeRef.contentWindow

  if (iframeWindow?.ResizeObserver) {
    resizeObserver = new iframeWindow.ResizeObserver(scheduleHeightUpdate)
    resizeObserver.observe(doc.body)
  }

  if (iframeWindow?.MutationObserver) {
    mutationObserver = new iframeWindow.MutationObserver(scheduleHeightUpdate)
    mutationObserver.observe(doc.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })
  }

  doc.querySelectorAll('img').forEach((image) => {
    if (image.complete) return
    image.addEventListener('load', scheduleHeightUpdate, { once: true })
    image.addEventListener('error', scheduleHeightUpdate, { once: true })
  })

  doc.fonts?.ready.then(scheduleHeightUpdate).catch(() => {})
}

const handleLoad = async () => {
  clearObservers()
  const iframeRef = iframe.value
  const doc = iframeRef?.contentDocument || iframeRef?.contentWindow?.document
  if (!iframeRef || !doc?.body || !doc.head) return

  prepareDocument(doc)
  observeDocument(iframeRef, doc)
  await nextTick()
  scheduleHeightUpdate()
}

watch(
  () => props.data,
  () => {
    isHidden.value = true
    clearObservers()
  }
)

onBeforeUnmount(clearObservers)
</script>

<style lang="less">
.text-content-frame {
  display: block;
  width: 100%;
  height: 0;
  border: 0;
}

.is-hidden {
  opacity: 0;
}
</style>
