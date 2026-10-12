<template>
  <q-dialog
    v-model="showDialog"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="closed"
    @show="onShow"
    @hide="onHide"
  >
    <q-card :class="['bg-grey-2', maximizedToggle ? undefined : 'border-radius']"
            :style="maximizedToggle ? {} : {width: width, maxWidth: width}">

      <!-- header -->
      <div class="row full-width q-pa-sm justify-between items-center">

        <!-- icon, title -->
        <div class="row q-gutter-x-sm items-center text-grey-8">

          <!-- icon -->
          <q-icon name="o_turned_in_not" size="sm"/>

          <!-- title -->
          <div class="text-subtitle1">
            {{ title }}
          </div>

        </div>

        <!-- actions -->
        <div class="row q-gutter-x-sm items-center">

          <!-- minimize -->
          <div v-if="fullScreenButton && maximizedToggle">
            <q-btn class="border-radius" icon="fullscreen_exit"
                   color="light-blue-2" text-color="light-blue-7" unelevated dense @click="maximizedToggle = false">
              <q-tooltip>کوچک نمایی</q-tooltip>
            </q-btn>
          </div>

          <!-- maximize -->
          <div v-if="fullScreenButton && !maximizedToggle">
            <q-btn class="border-radius" icon="fullscreen"
                   color="light-blue-2" text-color="light-blue-7" unelevated dense @click="maximizedToggle = true">
              <q-tooltip>تمام صفحه</q-tooltip>
            </q-btn>
          </div>

          <!-- close -->
          <div v-if="closeButton">
            <q-btn class="border-radius" icon="close" color="red-2" text-color="red-13" unelevated dense v-close-popup>
              <q-tooltip>بستن</q-tooltip>
            </q-btn>
          </div>

        </div>

      </div>

      <q-separator color="grey-4"/>

      <!-- body -->
      <q-card-section class="row q-col-gutter-sm">
        <slot>
          <s-input ref="components" v-for="(item,index) in components" :key="index" :property="item.property"
                   :model="item.model" :event="item.events" :visible="item.visible == null ? true : item.visible"
                   :disable="item.disable" @input="executeController"/>
        </slot>
      </q-card-section>

      <q-separator color="grey-4"/>

      <!-- footer (actions) -->
      <div class="row full-width q-pa-sm justify-end items-center">
        <slot name="actions">
          <div class="row q-gutter-x-sm items-center">

            <!-- submit -->
            <div>
              <q-btn class="border-radius" color="green-2" text-color="green-7" :label="okLabel" :loading="loading"
                     unelevated @click="submit"/>
            </div>

            <!-- close -->
            <div>
              <q-btn class="border-radius" color="red-2" text-color="red-7" :label="cancelLabel" unelevated
                     v-close-popup/>
            </div>

          </div>
        </slot>
      </div>

    </q-card>
  </q-dialog>
</template>

<script>
import SInput from 'components/shared/SInput'

export default {
  name: 'SDialog',
  components: {
    SInput,
  },
  props: {
    title: String,
    description: String,
    fullScreenButton: {
      type: Boolean,
      default: true
    },
    closeButton: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'sm'
    },
    components: {
      type: Array,
      required: false,
      default: () => []
    },
    controller: {
      type: Function | null,
      default: null
    },
    okLabel: {
      type: String,
      default: 'ثبت'
    },
    cancelLabel: {
      type: String,
      default: 'انصراف'
    }
  },
  computed: {
    width() {
      switch (this.size) {
        case 'sm':
          return '450px';
        case 'md':
          return '750px';
        case 'lg':
          return '950px';
        case 'full':
          return '100%';
        default:
          return '450px';
      }
    }
  },
  data: () => ({
    showDialog: false,
    maximizedToggle: false,
    resolve: null,
    func: Function,
    loading: false,
    apiUrl: process.env.API_URL
  }),
  methods: {
    async executeController() {
      if (this.controller == null) return
      await this.controller({components: this.components, axios: this.$axios, ctx: this})

    },
    open(func) {
      this.func = func
      return new Promise((resolve, reject) => {
        this.showDialog = true
        this.resolve = resolve
      })
    },

    async submit() {
      this.loading = true;
      let hasValidationError = false;
      for (let component of this.$refs.components || []) {
        const cmp = component.getComponent()
        if (cmp.validate && !(await cmp.validate())) {
          hasValidationError = true
          this.$q.notify({
            type: 'negative',
            message: 'خطای اعتبارسنجی',
            caption: component.getProperty().title
          })
        }
      }
      if (hasValidationError) {
        this.loading = false;
        return
      }
      const res = await this.func()
      if (res) {
        this.resolve(true)
        this.resolve = null
        this.showDialog = false
      }
      this.loading = false;
    },

    close() {
      this.showDialog = false
    },

    closed() {
      this.showDialog = false
      if (this.resolve != null) {
        this.resolve(false)
      }
    },
    keydown(e) {
      if (this.disableListenKey || e.repeat) return
      if (e.key === "Escape") {
        //this.close()
      } else if (e.key === "Enter" && e.ctrlKey) {
        this.submit()
      }
    },
    onShow() {
      this.executeController()
      this.$emit('show')
      document.addEventListener('keydown', this.keydown);
    },
    onHide() {
      this.$emit('hide')
      document.removeEventListener('keydown', this.keydown);
    }
  },
}
</script>

<style scoped>
.border-radius {
  border-radius: 0.5rem !important;
}
</style>

