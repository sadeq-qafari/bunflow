<template>
  <q-card bordered class="border-radius q-my-md no-shadow">
    <q-card-section>
      <div class="text-h6">ارسال پیام به مسافران</div>
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <q-form class="row" @submit.prevent="sendMessage">
        <div class=" full-width">
          <!-- The message that passengers will receive -->
          <q-input dense class="border-radius" v-model="text" outlined type="textarea"
                   label="متن پیام"/>
        </div>
        <div class="row items-end full-width">
          <div class="col-9 row q-my-md">
            <!-- Should This Message be sent wia SMS? -->
            <q-toggle dense v-model="sms" label="پیامک" class="q-py-sm col-6 justify-start"/>
            <!-- Should This Message be sent wia Notification? -->
            <q-toggle dense v-model="notif" label="نوتیفیکیشن"  class="q-py-sm col-6 justify-start"/>
          </div>
          <div class="col-12">
            <q-btn unelevated label="ارسال" type="submit" color="primary" class="full-width q-py-sm border-radius"/>
          </div>
        </div>

      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: "TourManagementSendMessage",
  props:{tourId : 0},

  data() {
    return {
      // ===== message options
      text: '',
      sms: false,
      notif: false
    }
  },
  methods: {
    sendMessage() {
      // ==== fires sendMessage event in parent element
      this.$emit('sendMessage',
        {
          text: this.text,
          sms: this.sms,
          notif: this.notif
        });
    }
  }
}
</script>

<style scoped>
</style>

