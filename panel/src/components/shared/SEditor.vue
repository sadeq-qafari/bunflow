<template>
  <div class="column">
    <span class="q-mb-sm">{{ label }}</span>
    <q-editor
      ref="editor"
      :value="value"
      @input="$emit('input', $event)"
      @paste.native="evt => pasteCapture(evt)"
      @drop.native="evt => dropCapture(evt)"
      :dense="$q.screen.lt.md"
      :definitions="{
        upload: {
          tip: 'افزودن تصویر',
          icon: 'cloud_upload',
          label: 'آپلود',
          handler: openFilePicker
        },
        attachCode: {
          tip: 'درج کد',
          icon: 'integration_instructions',
          label: 'درج کد',
          handler: openAttachCodeDialog
        },
        cta: {
          tip: 'cta',
          icon: 'ios_share',
          label: 'cta',
          handler: openCtaDialog
        },
      }"
      :toolbar="[
        [
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: true,
            options: ['left', 'center', 'right', 'justify']
          }
        ],
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
        ['token', 'hr', 'link', 'upload','attachCode','cta'],
        [
          {
            label: $q.lang.editor.formatting,
            icon: $q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'code'
            ]
          },
          {
            label: $q.lang.editor.fontSize,
            icon: $q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          },
          {
            label: $q.lang.editor.defaultFont,
            icon: $q.iconSet.editor.font,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'default_font',
              'arial',
              'arial_black',
              'comic_sans',
              'courier_new',
              'impact',
              'lucida_grande',
              'times_new_roman',
              'verdana'
            ]
          },
          'removeFormat'
        ],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
        ['undo', 'redo'],
        ['viewsource'],
        ['fullscreen'],
      ]"
      :fonts="{
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
      }"
    />
    <q-file v-show="false"
            v-model="file"
            @input="uploadImage"
            ref="fileInput"
            label="Pick one file"
            filled
            style="max-width: 300px"
    />
    <q-inner-loading :showing="uploadProgress.isLoading">
      <q-spinner-dots size="50px" color="primary"/>
    </q-inner-loading>
    <q-dialog v-model="showAttachCodeDialog" persistent>
      <q-card style="min-width: 650px">
        <q-card-section>
          <div class="text-h6">کد خود را وارد کنید</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input label="کد" outlined type="textarea" dir="ltr" dense v-model="code" autofocus @keyup.enter="attachCode"/>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn unelevated color="positive" label="درج کد" @click="attachCode"/>
          <q-btn unelevated color="negative" label="انصراف" v-close-popup @click="code=''"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showCtaDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">عنوان و آدرس موردنظر را وارد کنید</div>
        </q-card-section>

        <q-card-section class="q-pt-none row justify-between">
          <q-input class="col-12 q-mb-sm" outlined label="عنوان" dense v-model="cta.title" autofocus @keyup.enter="attachCode"/>
          <q-input class="col-12 q-mb-sm" outlined label="لینک" dir="ltr" dense v-model="cta.link" autofocus
                   @keyup.enter="attachCode"/>
          <q-btn class="col-5" unelevated label="رنگ زمینه" icon="invert_colors" color="cyan" text-color="white">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-color v-model="cta.color" no-header
                       no-footer
                       default-view="palette"
                       v-close-popup/>
            </q-popup-proxy>
          </q-btn>
          <q-btn class="col-5" unelevated label="رنگ متن" icon="title" color="cyan" text-color="white">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-color v-model="cta.textColor" no-header
                       no-footer
                       default-view="palette"
                       v-close-popup/>
            </q-popup-proxy>
          </q-btn>
        </q-card-section>
        <q-separator/>
        <q-card-section class="row justify-around items-center">
          <div>پیش نمایش:</div>
          <a :href="cta.link" target="_blank" :id="`ctaTag-${ctaTagId}`"
             :style="{cursor: 'pointer', padding:'4px','text-decoration': 'none','background-color': cta.color, color: cta.textColor, 'border-radius': '5px'}">{{
              cta.title
            }}</a>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right" class="text-primary">
          <q-btn unelevated color="positive" label="درج" @click="attachCta()"/>
          <q-btn unelevated color="negative" label="انصراف" v-close-popup @click="code=''"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: "SEditor",
  props: {
    value: String | null,
    label: String,
  },
  data: () => ({
    file: null,
    code: '',
    ctaTagId: 1,
    cta: {
      title: 'عنوان',
      link: 'https://',
      color: '#d60000',
      textColor: '#ffffff'
    },
    showAttachCodeDialog: false,
    showCtaDialog: false,
    cdnDownloadUrl: `${process.env.API_URL}/cdn/download`,
    cdnUploadUrl: `${process.env.API_URL}/cdn/upload`,
    uploadProgress: {
      isLoading: false,
      percent: 0
    },
  }),
  methods: {
    pasteCapture(evt) {
      console.log(evt)

      this.file = evt.clipboardData.files[0]
      if (evt.clipboardData.files[0]) {
        evt.preventDefault()
        this.uploadImage()
      }

    },
    dropCapture(evt) {
      evt.preventDefault()
      this.file = evt.dataTransfer.files[0]
      if (evt.dataTransfer.files[0]) this.uploadImage()
    },
    openFilePicker() {
      this.$refs.fileInput.$el.click()
    },
    async uploadImage() {
      this.uploadProgress.isLoading = true
      let fileAddress = ""
      const data = new FormData()
      data.append('file', this.file)
      const res = await this.$axios.post(`${this.cdnUploadUrl}/image`, data, {
        onUploadProgress: progressEvent => {
          this.uploadProgress.percent = progressEvent.loaded / progressEvent.total
        },
        noNotify: true
      }).catch(() => {
        this.uploadProgress.isLoading = false
      })

      if (res.data && res.data.length > 0) {
        fileAddress = res.data[0].urls[0]
      }
      if (fileAddress)
        this.$refs.editor.runCmd('insertHTML',
          '<img style="max-width: 100%;" src="' + `${this.cdnDownloadUrl}/${fileAddress}` + '"/><br>')
      this.uploadProgress.isLoading = false
    },
    openAttachCodeDialog() {
      this.showAttachCodeDialog = true
    },
    openCtaDialog() {
      this.showCtaDialog = true
    },
    attachCode() {
      if (this.code.trim().length > 0) {
        this.showAttachCodeDialog = false
        setTimeout(() => {
          this.$refs.editor.runCmd('insertHTML',
            `${this.code}<br>`, false)
          this.code = null
        }, 50)

      }
    },
    attachCta() {
      this.showCtaDialog = false
      let tag = document.getElementById('ctaTag-'+this.ctaTagId).outerHTML
      this.ctaTagId++
      setTimeout(() => {
        this.$refs.editor.runCmd('insertHTML',
          `${tag} <br><br><br>`)
        this.cta.title = 'عنوان'
        this.cta.link = 'https://'
      }, 50)

    }
  }
}
</script>

<style>
.h_iframe-aparat_embed_frame {
  position: relative;
}

.h_iframe-aparat_embed_frame .ratio {
  display: block;
  width: 100%;
  height: auto;
}

.h_iframe-aparat_embed_frame iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

