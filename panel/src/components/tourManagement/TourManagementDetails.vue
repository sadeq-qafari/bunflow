<template>
  <q-card bordered class="border-radius q-my-md no-shadow">
    <q-card-section>
      <div class="text-h6">مشخصات تور</div>
    </q-card-section>

    <q-separator/>

    <q-card-section >
      <!-- What tour it is -->
      <div class="full-width justify-between q-pa-sm row">
        <label class="col-4">تور:</label>
        <span class="col-8 text-subtitle2 text-left">{{tourObject.title}}</span>
      </div>
      <!-- How much passengers are in this tour -->
      <div class="full-width justify-between q-pa-sm row">
        <label class="col-4">تعداد مسافران:</label>
        <span class="col-8 text-subtitle2 text-left">{{tourObject.passengers + ' نفر'}}</span>
      </div>
      <!-- Who leads this tour -->
      <div class="full-width justify-between q-pa-sm row">
        <label class="col-4">لیدر:</label>
        <span class="col-8 text-subtitle2 text-left">{{tourObject.leader}}</span>
      </div>
      <!-- How percent of this tour is passed -->
      <div class="full-width justify-between q-pa-sm row q-mt-xs">
        <label class="col-6">پیشرفت تور:</label>
        <q-linear-progress stripe size="15px" color="primary" :value="calculateProgress" class="q-my-sm border-radius" />
      </div>
      <!-- Count of passed and remained events -->
      <div class="full-width justify-between q-px-sm row">
        <span class="col-6 text-left"><b>{{tourObject.passedEvents}}</b> رویداد برگزار شده</span>
        <span class="col-6 text-left"><b>{{tourObject.remainingEvents}}</b> رویداد باقی مانده</span>
      </div>
      <!-- What is happening currently in the tour -->
      <div class="full-width justify-between q-pa-sm row q-my-sm">
        <label v-if="tourObject.currentEvent.statusLookup === 1" class="col-4 text-primary text-bold">رویداد بعدی:</label>
        <label v-else class="col-4">رویداد جاری:</label>
        <span class="col-8 text-subtitle2 text-left">{{tourObject.currentEvent.title}}</span>
      </div>
      <!-- Change event statuses -->
      <q-btn unelevated dense @click="changeStatus" v-if="tourObject.currentEvent.id !== 0" :label="tourObject.currentEvent.statusLookup === 3 ? 'پایان رویداد جاری' : 'شروع رویداد'"
             class="full-width border-radius q-pa-sm" :color="tourObject.currentEvent.statusLookup === 3 ? 'red-4' : 'blue-4'"/>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: "TourManagementDetails",
  emits:['changeStatus'],
  props:{
    tourObject : {
      type:Object,
      Required:true
    }
  },
  methods:{
    changeStatus(){
      if(this.tourObject.currentEvent.statusLookup === 3)
        this.$emit('changeStatus',this.tourObject.currentEvent)
      else
        this.$emit('scrollIntoEvent',this.tourObject.currentEvent)
    },
  },
  computed:{
    calculateProgress(){
      return (this.tourObject.passedEvents / this.tourObject.totalEventsCount);
    }
  }
}
</script>

<style scoped>
</style>

