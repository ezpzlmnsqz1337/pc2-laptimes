module.exports = {
  publicPath: '/',
  productionSourceMap: false,
  pwa: {
    name: 'PC2 Laptimes',
    themeColor: '#080d16',
    msTileColor: '#080d16',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'blue',
    iconPaths: {
      faviconSVG: 'icons/favicon.svg',
      favicon32: null,
      favicon16: null,
      appleTouchIcon: 'icons/apple-touch-icon.png',
      maskIcon: null,
      msTileImage: null
    },
    manifestOptions: {
      name: 'PC2 Laptimes',
      short_name: 'PC2 Laptimes',
      start_url: '/',
      display: 'standalone',
      background_color: '#080d16',
      theme_color: '#080d16',
      icons: [
        {
          src: '/icons/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    }
  }
}
