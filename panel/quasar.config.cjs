/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

var path = require('path')
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const {styles} = require('@ckeditor/ckeditor5-dev-utils');


// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const {configure} = require('quasar/wrappers')

const devEnv = {
  API_URL: 'http://localhost:5000',
  REPORT_URL: 'http://localhost:8080'
}

const prodEnv = {
  API_URL: process.env.FLOW_STANDALONE ? '/api' : 'http://localhost:5000',
  FLOW_STANDALONE: !!process.env.FLOW_STANDALONE,
  REPORT_URL: 'http://localhost:8080'
}

module.exports = configure(function (ctx) {
  return {
    sourceFiles: {
      // Keep the existing Vuex store; Quasar's Vue 3 CLI otherwise only looks
      // for its default Pinia directory and would omit the store entirely.
      store: 'src/store/index.ts'
    },

    // https://quasar.dev/quasar-cli/supporting-ts
    supportTS: {
      tsCheckerConfig: {
        eslint: { enabled: false, files: './src/**/*.{ts,vue}' }
      }
    },

    // https://quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/boot-files
    boot: [
      'composition-api',
      'i18n',
      'axios',
      'api',
      'shared',
      'ck-editor',
      'signalR'
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
      'material-icons-outlined',

    ],

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      vueRouterMode: 'history', // available values: 'hash', 'history',

      env: ctx.dev ? devEnv : prodEnv,

      transpile: true,

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      transpileDependencies: ['/ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/'],

      rtl: true, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/handling-webpack
      extendWebpack(cfg) {
        //#region CKEditor
        cfg.plugins.push(new CKEditorWebpackPlugin({
          // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
          language: 'fa',

          // Append translations to the file matching the `app` name.
          translationsOutputFile: /app/
        }))

        const filesRuleIndex = cfg.module.rules.findIndex(item => {
          return item.test.test('.svg')
        })

        if (filesRuleIndex !== -1) {
          cfg.module.rules[filesRuleIndex].test = /\.(png|jpe?g|gif|webp)$/
          const svgRule = {...cfg.module.rules[filesRuleIndex]}
          svgRule.test = /\.svg/
          svgRule.exclude = svgRule.exclude || []
          svgRule.exclude.push(path.join(__dirname, 'node_modules', '@ckeditor'))
          cfg.module.rules.push(svgRule)
        }

        cfg.module.rules.push({
          test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
          use: ["raw-loader"]
        })
        //#endregion CKEditor
      },
      //#region CKEditor

      chainWebpack: config => {
        config.resolve.alias.set(
          '@quasar/extras',
          path.join(path.dirname(require.resolve('@quasar/extras/package.json')), 'exports')
        )

        // Use Vue's migration build while the legacy screens transition to Vue 3.
        config.resolve.alias.set('vue$', '@vue/compat')
        config.module.rule('vue').use('vue-loader').tap(options => ({
          ...options,
          compilerOptions: {
            ...options.compilerOptions,
            compatConfig: { MODE: 3 }
          }
        }))

        // (2.) Transpile the .css files imported by the editor using PostCSS.
        // Make sure only the CSS belonging to ckeditor5-* packages is processed this way.
        config.module
          .rule('cke-css')
          .test(/ckeditor5-[^/\\]+[/\\].+\.css$/)
          .use('postcss-loader')
          .loader('postcss-loader')
          .tap(() => {
            return styles.getPostCssConfig({
              themeImporter: {
                themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
              },
              minify: true
            });
          });
      }
      //#endregion CKEditor

    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 4200,
      open: true // opens browser window automatically
    },

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: 'material-icons', // Quasar icon set
      lang: 'fa-IR', // Quasar language pack
      config: {
        //dark: 'auto'
      },

      // Possible values for "importStrategy":
      // * 'auto' - (DEFAULT) Auto-import needed Quasar components & directives
      // * 'all'  - Manually specify what to import
      importStrategy: 'auto',

      // For special cases outside of where "auto" importStrategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'Notify',
        'BottomSheet',
        'Meta',
        'LocalStorage'
      ]
    },

    animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    // animations: [],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW
      manifest: {
        name: ' ',
        short_name: ' ',
        description: ' ',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'saanaa-panel'
      },

      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: true,

      extendWebpack(cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      }
    }
  }
})

