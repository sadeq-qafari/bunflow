<template>
  <div :class="['full-width',!flat?'rounded-borders border-solid bg-white':'']">
    <div class="row q-gutter-x-xs items-stretch">

      <!-- hex -->
      <q-input :model-value="modelValue" v-bind="$attrs" class="col" dir="ltr" borderless dense @update:model-value="$emit('update:modelValue', $event)"/>

      <!-- color picker -->
      <div class="col-auto q-pa-xs">
        <q-btn class="full-width rounded-borders" :style="{color: modelValue}" icon="palette"
               flat dense>
          <q-popup-proxy anchor="center start" self="center end">
            <q-color :model-value="modelValue" default-view="palette"
                     :palette="colors"
                     no-footer no-header-tabs flat @update:model-value="$emit('update:modelValue', $event)"/>
          </q-popup-proxy>
        </q-btn>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "FColorPicker",
  props: {
    modelValue: {
      type: String,
      default: '#0ea5e9'
    },
    flat:{
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    colors: [
      '#dc2626',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#10b981',
      '#14b8a6',
      '#0ea5e9',
      '#6366f1',
      '#a855f7',
      '#ec4899'
    ]
  })
}
</script>

