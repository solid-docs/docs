// mashlib 3.1.0 fetches three extra files from the root of the site that hosts the page:
//   /410.js                    the source editor (loaded when it is first opened)
//   /841.js                    the JSON-LD parser (loaded when a JSON-LD document is first read)
//   /5fb2ef310e691f59285b.js   the login client's SharedWorker
// These demo pages live under /docs/, not at the root, and load mashlib from jsDelivr.
// This script must run before mashlib.min.js. It sends the two lazy parts to jsDelivr
// and the worker to the copy beside this file (a SharedWorker must be same-origin).
// Without it the parts fail to load and the login check waits 5 seconds for the worker.
(function () {
  var CDN = 'https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/'
  var HERE = new URL('.', document.currentScript.src).href
  var moved = {
    '/410.js': CDN + '410.js',
    '/841.js': CDN + '841.js',
    '/5fb2ef310e691f59285b.js': HERE + '5fb2ef310e691f59285b.js'
  }
  function fix (value) {
    try {
      var url = new URL(value, location.href)
      if (url.origin === location.origin && moved[url.pathname]) return moved[url.pathname]
    } catch (e) {}
    return value
  }
  var Shared = window.SharedWorker
  if (Shared) {
    window.SharedWorker = function (url, options) { return new Shared(fix(String(url)), options) }
    window.SharedWorker.prototype = Shared.prototype
  }
  var src = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')
  Object.defineProperty(HTMLScriptElement.prototype, 'src', {
    configurable: true,
    enumerable: true,
    get: src.get,
    set: function (value) { src.set.call(this, fix(String(value))) }
  })
})()
