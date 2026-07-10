(function () {
    var config = window.CLAUDIA_CANVAS_NEST || {}
    var isMobile = /Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent)
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || (config.mobile === false && isMobile)) return

    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    var root = document.documentElement
    var width = 0
    var height = 0
    var deviceRatio = 1
    var points = []
    var mouse = { x: null, y: null, max: config.mouseDistance || 20000 }
    var pointCount = config.count || 99
    var maxDistance = config.maxDistance || 6000

    canvas.className = 'canvas-nest-background'
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'position: fixed; inset: 0; z-index: 0; opacity: 1; width: 100vw; height: 100vh; pointer-events: none;'

    document.body.appendChild(canvas)

    function getThemeValue(name, fallback) {
        var value = getComputedStyle(root).getPropertyValue(name).trim()
        return value || fallback
    }

    function resize() {
        width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        deviceRatio = Math.min(window.devicePixelRatio || 1, 2)

        canvas.width = Math.floor(width * deviceRatio)
        canvas.height = Math.floor(height * deviceRatio)
        context.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0)
    }

    function createPoints() {
        points = []

        for (var i = 0; i < pointCount; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                xa: Math.random() * 2 - 1,
                ya: Math.random() * 2 - 1,
                max: maxDistance
            })
        }
    }

    function draw() {
        var color = getThemeValue('--canvas-nest-color', '230,230,230')
        var opacity = Number(getThemeValue('--canvas-nest-opacity', '0.35'))
        var linkedPoints = [mouse].concat(points)

        context.clearRect(0, 0, width, height)
        context.globalAlpha = opacity

        points.forEach(function (point) {
            point.x += point.xa
            point.y += point.ya
            point.xa *= point.x > width || point.x < 0 ? -1 : 1
            point.ya *= point.y > height || point.y < 0 ? -1 : 1

            context.fillStyle = 'rgb(' + color + ')'
            context.fillRect(point.x - 0.5, point.y - 0.5, 1, 1)

            linkedPoints.forEach(function (other) {
                if (point === other || other.x === null || other.y === null) return

                var xDistance = point.x - other.x
                var yDistance = point.y - other.y
                var distance = xDistance * xDistance + yDistance * yDistance

                if (distance >= other.max) return

                if (other === mouse && distance >= other.max / 2) {
                    point.x -= xDistance * 0.03
                    point.y -= yDistance * 0.03
                }

                var lineOpacity = (other.max - distance) / other.max
                context.beginPath()
                context.lineWidth = lineOpacity / 2
                context.strokeStyle = 'rgba(' + color + ',' + (lineOpacity + 0.2) + ')'
                context.moveTo(point.x, point.y)
                context.lineTo(other.x, other.y)
                context.stroke()
            })

            linkedPoints.splice(linkedPoints.indexOf(point), 1)
        })

        context.globalAlpha = 1
        requestAnimationFrame(draw)
    }

    resize()
    createPoints()

    window.addEventListener('resize', function () {
        resize()
        createPoints()
    })
    window.addEventListener('mousemove', function (event) {
        mouse.x = event.clientX
        mouse.y = event.clientY
    })
    window.addEventListener('mouseout', function () {
        mouse.x = null
        mouse.y = null
    })

    requestAnimationFrame(draw)
})()
