<template>
  <div class="flex column full-height"
  style="background-image: url('img/chat-background.jpg');
  background-repeat: repeat;">
    <q-toolbar class="bg-grey-3 col-1">
      <q-toolbar-title>
        {{ title }}
      </q-toolbar-title>
      <div>{{ description }}</div>
    </q-toolbar>
    <div class="q-pa-md flex column col">
      <q-scroll-area ref="chatScrollArea"
                     :thumb-style="{left: '4px',borderRadius: '5px',backgroundColor: '#027be3'
                     ,width: '5px',opacity: 0.2}"
                     :bar-style="{opacity: 0}"
                     class="full-width col"
      >
        <q-chat-message v-for="msg of chat" :key="JSON.stringify(msg)"
                        :name="msg.name"
                        :text="msg.text"
                        :stamp="msg.stamp"
                        :sent="msg.sent"
                        style="max-width: 100%; margin-left: 12px;"
                        :bg-color="msg.sent?'blue-2':'light-green-2'"
                        text-color="black"
        />
      </q-scroll-area>
      <div v-if="file" class="bg-grey-2 q-pa-xs rounded-borders col-2">
        <q-img :ratio="16/9" contain :src="previewImageSrc" height="100%" class="rounded-borders"/>
      </div>
      <div class="q-pa-sm col-1 full-width">

        <q-input dense outlined :placeholder="file?' تصویر':'متن پیام'" v-model="message" @keyup.enter="sendMessage" class="full-width">
          <template v-slot:append>
            <q-btn round dense flat icon="o_send" class="rotate-180" @click="sendMessage"/>
            <q-btn round dense flat icon="o_attach_file" @click="selectFile"/>
          </template>
        </q-input>
        <q-file v-show="false" :value="file" @input="updateFiles" ref="file"/>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: "Chat",
  data: () => ({
    message: null,
    selectedMessages: [],
    file: null,
    fileObject: {},
    previewImageSrc: undefined,
    cdnUploadUrl: `${process.env.API_URL}/cdn/upload`

  }),
  props: {
    title: String,
    description: String,
    chat: Array,
    sendFn: Function,
    uploadFn: Function,
    reloadFn: Function,
    tools: Object
  },
  methods: {
    async sendMessage() {
      console.log('this.file', this.fileObject)
      if (this.file) {
        await this.upload().then(() => {
          this.uploadFn(this)
          this.reloadFn()
        })
      } else {
       await this.sendFn(this)
        this.reloadFn()
      }
    },
    selectFile() {
      this.$refs.file.pickFiles()
    },
    updateFiles(file) {
      this.file = file
      this.uploadProgress = 0
      if (file != null) {
        const reader = new FileReader();
        reader.onload = e => {
          this.previewImageSrc = e.target.result
        }
        reader.readAsDataURL(file);
      }
    },
    async upload() {
      this.uploadProgress = 1
      const data = new FormData()
      data.append('file', this.file)
      const res = await this.$axios.post(`${this.cdnUploadUrl}/image`, data, {
        onUploadProgress: progressEvent => {
          this.uploadProgress = progressEvent.loaded / progressEvent.total
        }
      }).catch(err => {
        this.uploadProgress = 0
      })
      if (res.data && res.data.length > 0) {
        this.fileObject = {}
        this.fileObject.fileName = res.data[0].urls[0]
        this.fileObject.alt = res.data[0].urls[0]
        this.fileObject.description = this.message
        this.uploadProgress = 0
        this.file = null
      }

    },
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>

