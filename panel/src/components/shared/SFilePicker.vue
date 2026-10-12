<template>
  <q-file dense
          :value="file"
          @input="updateFile"
          outlined
          clearable
          @clear="clearInput" accept="image/*"
  >
    <template v-slot:prepend>
      <q-icon name="attach_file"/>
    </template>
    <template v-slot:append>
      <q-btn icon="upload" round padding="0" flat v-if="canUpload && !uploading" @click="upload" class="alt-btn"/>
      <q-circular-progress v-else-if="uploading"
                           :min="40"
                           :max="70"
                           :indeterminate="uploadProgress.percent<=0"
                           :value="uploadProgress.percent"
                           size="20px"
                           :thickness="0.2"
                           :color="uploadProgress.color"
                           track-color="grey-3"
      />
      <q-btn icon="hdr_auto" round padding="0" flat v-if="imageSrc" class="alt-btn">
        <q-popup-proxy>
          <q-card flat>
            <q-input :value="value && value.alt" @input="onInputAlt" class="q-pa-xs" label="متن جایگزین" dense outlined/>
            <q-input :value="value && value.description" @input="onInputDescription" class="q-pa-xs" label="توضیحات" dense
                     outlined/>
          </q-card>
        </q-popup-proxy>
      </q-btn>
    </template>
    <template>
      <div
        :class="['row col-12 q-my-xs rounded-borders justify-center items-center overflow-hidden']">
        <div class="row col-12 full-height items-center justify-between text-black">

          <div>
              <span class="q-px-xs">
                {{ label }}
              </span>
          </div>
          <q-space/>
          <div class="col-auto">
            <q-avatar rounded v-if="imageSrc" size="sm">
              <img class="rounded-borders" :src="imageSrc">
              <q-tooltip content-class="bg-transparent">
                <q-img :src="imageSrc" width="150px" height="100%" contain class="rounded-borders bg-white"/>
              </q-tooltip>
            </q-avatar>
          </div>

        </div>
      </div>
    </template>
    <template v-slot:file>
    </template>
  </q-file>
</template>

<script>

export default {
  name: "SFilePicker",
  data: () => ({
    file: null,
    uploadProgress: {},
    uploading: false,
    previewImageSrc: undefined,
    cdnDownloadUrl: `${process.env.API_URL}/cdn/download`,
    cdnUploadUrl: `${process.env.API_URL}/cdn/upload`,


  }),
  props: {
    value: Object,
    label: String | null,
    isRequired: Boolean
  },
  computed: {
    canUpload() {
      return this.file !== null && this.file.size > 0
    },

    imageSrc() {
      if (this.previewImageSrc) {
        return this.previewImageSrc
      } else if (this.value && this.value.fileName) {
        return `${this.cdnDownloadUrl}/${this.value.fileName}`
      }
    },
    fileSize() {
      if (this.file && this.file.size) {
        return `${(this.file.size / 1024).toFixed(0)}kb`
      }
    }
  },
  methods: {
    onInputAlt(e) {
      this.$emit('input', Object.assign({}, this.value || {}, {alt: e}))
    },
    onInputDescription(e) {
      this.$emit('input', Object.assign({}, this.value || {}, {description: e}))
    },

    clearInput() {
      this.$emit('input', {})
      this.previewImageSrc = undefined
    },

    cancelFile() {
      this.uploadProgress = {
        ...this.uploadProgress,
        error: true,
        color: 'orange-2'
      }
    },

    updateFile(file) {
      this.file = file
      console.log('updateFile => ', this.file)
      if (file != null) {
        const reader = new FileReader();
        reader.onload = e => {
          this.previewImageSrc = e.target.result
        }
        reader.readAsDataURL(file);
      }
    },

    async upload() {
      this.uploadProgress.error = false
      this.uploadProgress.color = 'green'
      this.uploadProgress.percent = 0
      this.uploading = true

      const data = new FormData()
      data.append('file', this.file)

      try {
        const res = await this.$axios.post(`${this.cdnUploadUrl}/image`, data, {
          onUploadProgress: progressEvent => {
            console.log(progressEvent)
            this.uploadProgress.percent = (progressEvent.loaded / progressEvent.total) * 100
          }
        })
        console.log(res.data)
        if (res.data && res.data.length > 0) {
          this.value.fileName = res.data[0].urls[0]
          console.log(this.value.fileName)
          this.uploadProgress.percent = 0
          this.file = new File([], this.file.name)
        }
        this.uploading = false
      } catch (e) {
        this.uploadProgress.error = true
        this.uploadProgress.color = 'red'
        this.uploadProgress.error = 1
        this.uploading = false
      }


    },
    async validate() {
      if (this.canUpload) {
        await this.upload()
      }
      return true
    }
    ,
    getComponent() {
      return this
    }
    ,
  },
  mounted() {
    if (this.value && this.value.fileName) {
      this.file = new File([], this.value.fileName)
    } else if (this.value == null) {
      this.file = null
      this.$emit('input', {})
    }
  }
}
</script>

<style lang="scss" scoped>
.alt-btn {
  color: $grey !important;
}

.alt-btn:hover {
  color: rgba(0, 0, 0, 0.54) !important;
}
</style>

