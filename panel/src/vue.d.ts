import type { ComponentCustomProperties } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: any
    $axios: any
    $ws: any
    $chart: any
    $randomColor: (...args: any[]) => string
    $navigateBack: () => Promise<void>
    $openReport: (...args: any[]) => unknown
    $screenshot: () => Promise<Blob>
  }
}

export {}
