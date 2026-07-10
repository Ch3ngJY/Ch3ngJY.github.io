var $posts = {
    scroller: function () {
        function Scroller() {
            this.callbacks = []
            return this
        }
        Scroller.prototype.bindScrollEvent = function () {
            var _that = this

            window.addEventListener('scroll', function (event) {
                var wait = false
                var beforeOffsetY = window.pageYOffset

                if (wait) return
                wait = true

                setTimeout(function () {
                    var params = {
                        event: event,
                        beforeOffsetY: beforeOffsetY,
                    }
                    _that.callbacks.forEach(function (func) { func(params) })

                    wait = false
                }, 150)
            })
        }

        return Scroller
    },
    showTopic: function (evt) {
        var topicEl = document.getElementById('postTopic')
        var postTitle = document.getElementById('postTitle')

        var postTitleCoordinate = postTitle.getBoundingClientRect()
        var threshold = postTitle.offsetTop + postTitleCoordinate.height

        // show title
        if (window.pageYOffset > threshold) {
            var beforeOffsetY = evt && evt.beforeOffsetY
            var isScrollToTop = beforeOffsetY - window.pageYOffset > 0

            topicEl.classList.remove('is-hidden-topic-bar')

            if (beforeOffsetY - window.pageYOffset === 0) {
                topicEl.classList.remove('is-switch-post-title')
                topicEl.classList.remove('is-show-post-title')
                topicEl.classList.remove('immediately-show')

                if (topicEl.classList.contains('is-show-scrollToTop-tips')) {
                    topicEl.classList.remove('is-show-scrollToTop-tips')
                    topicEl.classList.add('is-flash-scrollToTop-tips')
                }
                else {
                    topicEl.classList.add('immediately-show')
                }
            }
            // scroll to up👆
            else if (isScrollToTop) {
                // show scroll to top tips
                if (window.pageYOffset > window.innerHeight * 2) {
                    topicEl.classList.remove('immediately-show')
                    topicEl.classList.remove('is-show-post-title')
                    topicEl.classList.remove('is-switch-post-title')
                    topicEl.classList.remove('is-flash-scrollToTop-tips')

                    topicEl.classList.add('is-show-scrollToTop-tips')
                }
                // show post title
                else {
                    topicEl.classList.remove('immediately-show')
                    topicEl.classList.remove('is-show-post-title')
                    topicEl.classList.remove('is-show-scrollToTop-tips')
                    topicEl.classList.remove('is-flash-scrollToTop-tips')

                    topicEl.classList.add('is-switch-post-title')
                }
            }
            // scroll to down👇
            else if (beforeOffsetY - window.pageYOffset !== 0) {
                topicEl.classList.remove('immediately-show')
                topicEl.classList.remove('is-switch-post-title')
                topicEl.classList.remove('is-show-scrollToTop-tips')
                topicEl.classList.remove('is-flash-scrollToTop-tips')
                topicEl.classList.add('is-show-post-title')
            }
        }
        else{
            // hidden all
            topicEl.classList.remove('is-flash-scrollToTop-tips')
            topicEl.classList.remove('is-show-scrollToTop-tips')
            topicEl.classList.remove('is-switch-post-title')
            topicEl.classList.remove('is-show-post-title')
            topicEl.classList.remove('immediately-show')

            topicEl.classList.add('is-hidden-topic-bar')
        }
    },
    catalogueHighlight: function () {
        var directory = document.querySelectorAll('.toc a')
        if (directory.length === 0) {
            return false
        }

        var tocContainer = document.querySelector('.toc')
        return function () {
            var contentTocList = []
            var activeClassName = 'is-active'

            directory.forEach(function (link) {
                if (!link.href) return
                var id = decodeURI(link.href).split('#')[1]
                contentTocList.push(document.getElementById(id))
            })
            var spacing = 60
            var activeTopicEl = null
            var scrollTop = window.pageYOffset
            for (var i = 0; i < contentTocList.length; i++) {
                var currentTopic = contentTocList[i]

                if (currentTopic.offsetTop > scrollTop + spacing / 2) {
                    // jump to next loop
                    continue
                }

                if (!activeTopicEl) {
                    activeTopicEl = currentTopic
                } else if (currentTopic.offsetTop + spacing >= activeTopicEl.offsetTop - spacing) {
                    activeTopicEl = currentTopic
                }

                var beforeActiveEl = document.querySelector('.toc' + ' .' + activeClassName)
                beforeActiveEl && beforeActiveEl.classList.remove(activeClassName)

                var selectTarget = '.toc a[href="#' + encodeURI(activeTopicEl.id) + '"]'
                var direc = document.querySelector(selectTarget)
                direc.classList.add(activeClassName)

                var tocContainerHeight = tocContainer.getBoundingClientRect().height
                if (direc.offsetTop >= tocContainerHeight - spacing) {
                    tocContainer.scrollTo({
                        // top: direc.offsetTop - spacing,
                        top: direc.offsetTop + 100 - tocContainerHeight,
                    })
                }
                else {
                    tocContainer.scrollTo({ top: 0 })
                }
            }
        }
    },
    smoothScrollToTop: function() {
        var Y_TopValve = (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop);
        if (Y_TopValve > 1) {
            window.requestAnimationFrame($posts.smoothScrollToTop);
            scrollTo(0, Math.floor(Y_TopValve * 0.85));
        } else {
            scrollTo(0, 0);
        }
    },
    smoothScrollToHash: function () {
        var links = document.querySelectorAll('.toc a[href^="#"], .post-content a[href^="#"]')
        var spacing = 58

        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                var rawHash = link.getAttribute('href')
                if (!rawHash || rawHash === '#') return

                var targetId = rawHash.slice(1)
                try {
                    targetId = decodeURIComponent(targetId)
                } catch (e) {}

                var targetEl = document.getElementById(targetId)
                if (!targetEl) return

                event.preventDefault()

                var targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - spacing
                window.scrollTo({
                    top: Math.max(targetTop, 0),
                    behavior: 'smooth'
                })
            })
        })
    },
    addValineComment() {
        var el = document.getElementById('vcomments')
        new Valine({
            el: '#vcomments',
            appId: el.dataset.comment_valine_id,
            appKey: el.dataset.comment_valine_key
        })
    },
    getGiscusTheme: function () {
        var container = document.getElementById('giscusComments')
        var current = 'light'

        if (window.$claudia && window.$claudia.appearance) {
            current = window.$claudia.appearance.getCurrent()
        } else if (window.matchMedia) {
            current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }

        if (current === 'dark') {
            return container && container.dataset.giscusThemeDark || 'dark'
        }

        return container && container.dataset.giscusThemeLight || 'light'
    },
    syncGiscusTheme: function () {
        var iframe = document.querySelector('iframe.giscus-frame')

        if (!iframe || !iframe.contentWindow) return

        iframe.contentWindow.postMessage({
            giscus: {
                setConfig: {
                    theme: $posts.getGiscusTheme()
                }
            }
        }, 'https://giscus.app')
    },
    bindGiscusThemeSync: function () {
        var appearance = window.$claudia && window.$claudia.appearance

        if (appearance && !appearance._giscusThemeSyncBound) {
            var originalApply = appearance.apply

            appearance.apply = function (mode, save) {
                originalApply.call(appearance, mode, save)
                $posts.syncGiscusTheme()
            }
            appearance._giscusThemeSyncBound = true
        }

        if (window.matchMedia && !this._giscusSystemThemeSyncBound) {
            var media = window.matchMedia('(prefers-color-scheme: dark)')
            var syncTheme = function () {
                $posts.syncGiscusTheme()
            }

            if (media.addEventListener) {
                media.addEventListener('change', syncTheme)
            } else if (media.addListener) {
                media.addListener(syncTheme)
            }

            this._giscusSystemThemeSyncBound = true
        }
    },
    showMissingGiscusConfig: function (container) {
        var isLocal = window.location.hostname === 'localhost'
            || window.location.hostname === '127.0.0.1'
            || window.location.hostname === '::1'
            || window.location.protocol === 'file:'

        if (isLocal) {
            var hint = container.querySelector('.giscus-config-hint')
            if (hint) hint.classList.remove('is-hidden')
        } else {
            container.hidden = true
        }

        container.dataset.giscusLoaded = 'true'
    },
    addGiscusComment: function () {
        var container = document.getElementById('giscusComments')

        if (!container || container.dataset.giscusLoaded === 'true') return

        if (container.dataset.giscusConfigMissing === 'true') {
            this.showMissingGiscusConfig(container)
            return
        }

        var mount = container.querySelector('.giscus')
        if (!mount) return

        var script = document.createElement('script')
        script.src = 'https://giscus.app/client.js'
        script.async = true
        script.crossOrigin = 'anonymous'
        script.setAttribute('data-repo', container.dataset.giscusRepo)
        script.setAttribute('data-repo-id', container.dataset.giscusRepoId)
        script.setAttribute('data-category', container.dataset.giscusCategory)
        script.setAttribute('data-category-id', container.dataset.giscusCategoryId)
        script.setAttribute('data-mapping', container.dataset.giscusMapping || 'pathname')
        script.setAttribute('data-strict', container.dataset.giscusStrict || '0')
        script.setAttribute('data-reactions-enabled', container.dataset.giscusReactionsEnabled || '1')
        script.setAttribute('data-emit-metadata', container.dataset.giscusEmitMetadata || '0')
        script.setAttribute('data-input-position', container.dataset.giscusInputPosition || 'bottom')
        script.setAttribute('data-theme', this.getGiscusTheme())
        script.setAttribute('data-lang', container.dataset.giscusLang || 'zh-CN')
        script.setAttribute('data-loading', container.dataset.giscusLoading || 'lazy')
        script.addEventListener('error', function () {
            var message = document.createElement('p')
            message.className = 'giscus-error-message'
            message.textContent = '评论加载失败，请稍后刷新重试。'
            container.appendChild(message)
        })

        mount.appendChild(script)
        container.dataset.giscusLoaded = 'true'
    },
    mounted: function () {
        hljs && hljs.initHighlighting()

        var Scroller = this.scroller()
        var scrollerInstance = new Scroller()

        var catalogueHighlight = this.catalogueHighlight()
        catalogueHighlight && scrollerInstance.callbacks.push(catalogueHighlight)

        scrollerInstance.callbacks.push(this.showTopic)

        scrollerInstance.bindScrollEvent()

        $claudia.fadeInImage(document.querySelectorAll('.post-content img'))

        document.getElementById('postTopic').addEventListener('click', this.smoothScrollToTop)

        this.smoothScrollToHash()

        window.Valine && this.addValineComment()
        this.addGiscusComment()
        this.bindGiscusThemeSync()
    }
}

$posts.mounted()
