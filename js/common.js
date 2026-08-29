window.$claudia = {
    throttle: function (func, time) {
        var wait = false
        return function () {
            if (wait) return
            wait = true

            setTimeout(function () {
                func()
                wait = false
            }, time || 100)
        }
    },
    toArray: function (list) {
        return Array.prototype.slice.call(list || [])
    },
    fadeInImage: function(imgs, imageLoadedCallback) {
        var images = imgs || document.querySelectorAll('.js-img-fadeIn')

        function loaded(event) {
            var image = event.currentTarget

            // Clear a stale fade transition left by a restored/cached page
            // before reading the component's transition from its stylesheet.
            image.style.removeProperty('transition')
            var computedTransition = window.getComputedStyle(image).transition
            var transitionRestored = false
            var restoreTimer

            function restoreTransition() {
                if (transitionRestored) return

                transitionRestored = true
                window.clearTimeout(restoreTimer)
                image.removeEventListener('transitionend', handleTransitionEnd)
                image.style.removeProperty('transition')
            }

            function handleTransitionEnd(transitionEvent) {
                if (transitionEvent.propertyName === 'opacity') restoreTransition()
            }

            image.addEventListener('transitionend', handleTransitionEnd)
            image.style.transition = computedTransition + ', opacity 320ms ease'
            image.style.opacity = 1
            // Cached images may already be fully opaque, so transitionend will
            // not fire. Always restore the stylesheet transition as a fallback.
            restoreTimer = window.setTimeout(restoreTransition, 400)

            if (image.parentElement && image.parentElement.classList.contains('skeleton')) {
                image.parentElement.classList.remove('skeleton')
            }
            imageLoadedCallback && imageLoadedCallback(image)
        }

        this.toArray(images).forEach(function (img) {
            if (img.complete) {
                return loaded({ currentTarget: img })
            }

            img.addEventListener('load', loaded)
        })
    },
    blurBackdropImg: function(image) {
        if (!image.dataset.backdrop) return

        var parent = image.parentElement //TODO: Not finish yes, must be a pure function
        var parentWidth = Math.round(parent.getBoundingClientRect().width)
        var childImgWidth = Math.round(image.getBoundingClientRect().width)

        var isCovered = parentWidth === childImgWidth
        var blurImg = parent.previousElementSibling //TODO: Not finish yes, must be a pure function

        isCovered ? blurImg.classList.add('is-hidden') : blurImg.classList.remove('is-hidden')
    },
    getSystemTheme(callback) {
        var media = window.matchMedia('(prefers-color-scheme: dark)')
        media.addEventListener('change', function (e){
            callback && callback(e.matches ? "dark" : "light")
        })

        callback && callback(media.matches ? 'dark' : 'light')
    },
    appearance: {
        key: 'claudia-appearance',
        modes: ['light', 'dark'],
        isMode: function (value) {
            return value === 'light' || value === 'dark'
        },
        getSaved: function () {
            try {
                var value = localStorage.getItem(this.key)
                return this.isMode(value) ? value : null
            } catch (e) {
                return null
            }
        },
        getCurrent: function () {
            var root = document.documentElement

            if (root.classList.contains('appearance-light')) return 'light'
            if (root.classList.contains('appearance-dark')) return 'dark'

            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        },
        apply: function (mode, save) {
            if (!this.isMode(mode)) return

            var root = document.documentElement
            root.classList.remove('appearance-auto', 'appearance-light', 'appearance-dark')
            root.classList.add('appearance-' + mode)

            if (save) {
                try {
                    localStorage.setItem(this.key, mode)
                } catch (e) {}
            }

            this.syncButtons(mode)
        },
        toggle: function () {
            var next = this.getCurrent() === 'dark' ? 'light' : 'dark'
            this.apply(next, true)
        },
        syncButtons: function (mode) {
            var current = mode || this.getCurrent()
            var next = current === 'dark' ? 'light' : 'dark'
            var icon = current === 'dark' ? '&#9728;' : '&#9790;'
            var label = next === 'dark' ? 'Switch to dark theme' : 'Switch to light theme'

            window.$claudia.toArray(document.querySelectorAll('.js-appearance-toggle')).forEach(function (button) {
                button.setAttribute('aria-label', label)
                button.setAttribute('title', label)

                var iconElement = button.querySelector('[data-theme-icon]')
                if (iconElement) iconElement.innerHTML = icon
            })
        },
        init: function () {
            var saved = this.getSaved()
            if (saved) this.apply(saved, false)

            var self = this
            window.$claudia.toArray(document.querySelectorAll('.js-appearance-toggle')).forEach(function (button) {
                button.addEventListener('click', function () {
                    self.toggle()
                })
            })

            this.syncButtons(saved)
        }
    }
};

(function () {
    try {
        var saved = window.$claudia.appearance.getSaved()
        if (saved) window.$claudia.appearance.apply(saved, false)

        document.addEventListener('DOMContentLoaded', function () {
            window.$claudia.appearance.init()
        })
    } catch (e) {
        console.error('Failed to initialize appearance toggle', e)
    }
})()
