<template>
  <div class="row q-col-gutter-sm no-padding">
    <q-file
      :model-value="file"
      @update:model-value="updateFiles"
      :label="label"
      outlined
      class="col-xs-12 col-sm-6 col-md-4 s-image-input"
      dense
      accept="image/*"
    >
      <div class="full-width full-height absolute-full row">
        <div class="col-4 full-height">
          <q-img class="full-height" :src="`${cdnDownloadUrl}/${value.fileName}`" :alt="value.alt"/>
        </div>
        <div class="col-6">
          <q-linear-progress
            stripe
            class="full-height"
            :value="uploadProgress.percent"
            :color="uploadProgress.color"
            track-color="transparent"
          />
          <q-tooltip content-style="background-color: transparent;">
            <q-img :src="previewImageSrc" style="width: 300px"/>
          </q-tooltip>
        </div>
        <div class="col column items-center content-center justify-center">
          <q-btn icon="cloud_upload" flat color="positive" size="md" class="full-width full-height" @click="upload"
                 :loading="isUploading" :disable="!canUpload" />
        </div>
      </div>
    </q-file>
    <q-input v-model="value.alt" outlined label="متن Alt" class="col-xs-12 col-sm-6 col-md-4" dense />
    <q-input v-model="value.description" outlined label="توضیحات" class="col-xs-12 col-sm-6 col-md-4" dense />
  </div>
</template>

<script>
export default {
  name: 'SImage',
  props: {
    value: Object,
    label: String
  },
  computed: {
    canUpload() {
      return this.file !== null
    },
  },
  data: () => ({
    file: null,
    uploadProgress: {},
    isUploading: false,
    previewImageSrc: undefined,
    cdnDownloadUrl:`${process.env.API_URL}/cdn/download`,
    cdnUploadUrl:`${process.env.API_URL}/cdn/upload`
  }),
  methods: {
    cancelFile() {
      this.uploadProgress.error = true
      this.uploadProgress.color = 'orange'
    },

    updateFiles(file) {
      this.file = file
      this.uploadProgress = {
        error: false,
        color: 'green',
        percent: 0
      }
      if (file != null) {
        const reader = new FileReader();
        reader.onload = e => {
          this.previewImageSrc = e.target.result
        }
        reader.readAsDataURL(file);
      }
    },

    upload() {
      this.uploadProgress.error = false
      this.uploadProgress.color = 'green'
      this.uploadProgress.percent = 0

      const data = new FormData()
      data.append('file', this.file)
      this.$axios.post(`${this.cdnUploadUrl}/image`, data, {
        onUploadProgress: progressEvent => {
          this.uploadProgress.percent = progressEvent.loaded / progressEvent.total
        }
      }).then(res => {
        console.log(res.data)
        if (res.data && res.data.length > 0) {
          this.value.fileName = res.data[0].urls[0]
          console.log(this.value.fileName)
          this.uploadProgress.percent = 0
        }
      }).catch(err => {
        this.uploadProgress.error = true
        this.uploadProgress.color = 'red'
        this.uploadProgress.error = 1
      })
    },
  }
}
</script>

<style>
.s-image-input {
  padding-right: 0;
  padding-left: 0;
}

.s-image-input .q-field__control {
  padding: 0 !important;
  overflow: hidden;
}
</style>

