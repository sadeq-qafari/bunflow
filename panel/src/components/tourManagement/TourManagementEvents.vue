<template>
  <q-card bordered class="border-radius q-my-md no-shadow">
    <q-card-section>
      <div class="text-h6">رویداد های تور</div>
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <div class="column q-gutter-y-md">
        <!-- for each day in the tour makes a container -->
        <div class="full-width border-solid border-radius" v-for="event in events">
          <div class="column full-width q-pa-md q-gutter-y-md">
            <!-- prints the day text in header -->
            <div class="text-subtitle1">روز {{ getDayText(event.day) }}</div>
            <q-separator/>
            <!-- for each event in this day makes an event object -->
            <div v-for="te in event.events" class="row full-width justify-between items-center">

              <!-- the title of event -->
              <div class="text-subtitle2 text-weight-regular text-black col q-ma-xs">
                {{ te.title }}
              </div>

              <!-- actions of this event -->
              <!-- #region Event Button Action -->
              <q-btn unelevated v-if="te === getCurrentEvent || te.statusLookup === 3"
                     color="primary" label="عملیات" class="text-subtitle2 col-auto"
                     @click="showActions(te);" id="currentEvent"/>
              <q-badge v-else class="text-subtitle2 col-auto" color="transparent" :text-color="getStatusTextColor(te)"
                       :label="getStatusTitle(te)"/>
              <!-- #endregion-->

            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Display Name, Description And available options of this event -->
    <q-dialog ref="actionsDialog" @hide="resetParams">
      <div class="full-width bg-white relative-position" style="border-radius: 1rem !important;" v-if="selectedEvent !== null">
        <div class="column full-width q-pa-md q-gutter-y-md">
          <div class="row full-width">
            <span class="col-12">نام رویداد انتخاب شده:</span>
            <span class="col-12 text-subtitle2 q-mt-xs">{{ selectedEvent.title }}</span>
          </div>
          <div class="row full-width">
            <div class="col-12">توضیحات رویداد:</div>
            <div class="col-12 q-mt-xs">
              <div style="height: fit-content; overflow-y: auto; max-height: 230px;" >
                <div class="text-subtitle2" v-html="selectedEvent.description"/>
              </div>
            </div>
          </div>
          <div class="full-width" v-if="selectedEvent.statusLookup === 1">
            <q-btn dense unelevated label="شروع رویداد" color="green-1" text-color="green-9"
                   class="full-width q-py-sm text-subtitle1 border-radius" padding="10px 30px"
                   @click="changeStatus(false)"/>
          </div>
          <div class="full-width" v-else>
            <q-btn dense unelevated label="پایان رویداد" color="cyan-1" text-color="cyan-9"
                   class="full-width q-py-sm text-subtitle1 border-radius" padding="10px 30px"
                   @click="changeStatus(false)"/>
          </div>
          <div class="full-width">
            <q-btn dense unelevated label="لغو رویداد" color="red-1" text-color="red-8"
                   class="full-width q-py-sm text-subtitle1 border-radius" padding="10px 30px"
                   @click="changeStatus(true)"/>
          </div>
        </div>
        <q-btn icon="close" class="absolute-top-right" unelevated color="transparent" text-color="black" @click="$refs.actionsDialog.hide()" style="font-size: 1.1rem;top: 5px;" />
      </div>
    </q-dialog>

    <!-- Shows a confirmation dialog for changing status of selected event -->
    <q-dialog ref="confirmDialog" persistent @hide="resetParams;">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm" id="dialogText">{{ dialogText }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="خیر" color="primary" @click="$refs.confirmDialog.hide()"/>
          <q-btn flat label="بله" color="primary" @click="confirmChange"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>

</template>

<script>
export default {
  name: "TourManagementEvents",
  // === Events of this component
  emits: ['cancelEvent', 'startEvent', 'finishEvent'],
  // === Properties
  props: {
    // === Array that holds a list of events of current tour
    events: Array
  },
  // === Data used in component
  data() {
    return {
      // === Store selected event
      selectedEvent: {},
      // === The text of confirmation dialog
      dialogText: '',
      // === Is Selected Event going to be canceled?
      cancelEvent: false,
    }
  },
  methods: {
    //Return what color should this text be
    getStatusTextColor(log) {
      switch (log.statusLookup) {
        case 1 :
          return 'cyan-5';
        case 2:
          return 'red-11';
        case 4:
          return 'green-4';
      }
    },
    getStatusTitle(te){
      switch (te.statusLookup)
      {
        case 1:
          return 'طبق برنامه';
        case 2:
          return 'لغو شده';
        case 4:
          return 'پایان یافته';
      }
    },
    //Shows the actions dialog and stores selected event
    showActions(te) {
      this.selectedEvent = te;
      this.$refs.actionsDialog.show();
    },

    //Resets selectedEvent and cancelEvent
    resetParams() {
      this.selectedEvent = null;
      this.cancelEvent = false;
    },
    //base on the status of clicked event, fires the qualified event
    changeStatus(cancel = false) {
      this.cancelEvent = cancel;

      if (cancel) {
        this.dialogText = "آیا از لغو رویداد انتخاب شده مطمئن هستید؟";
      } else {
        if (this.selectedEvent.statusLookup === 1)
          this.dialogText = "آیا از آغاز رویداد انتخاب شده مطمئن هستید؟";
        else if (this.selectedEvent.statusLookup === 3)
          this.dialogText = "آیا از پایان رویداد انتخاب شده مطمئن هستید؟";
      }
      this.$refs.confirmDialog.show();
    },
    //If user confirm the action related event will be fired
    confirmChange() {
      if (this.selectedEvent) {
        if (this.cancelEvent) {
          this.$emit('cancelEvent', this.selectedEvent.id);
        } else {
          if (this.selectedEvent.statusLookup === 1)
            this.$emit('startEvent', this.selectedEvent.id);
          else if (this.selectedEvent.statusLookup === 3)
            this.$emit('finishEvent', this.selectedEvent.id);
        }
        this.cancelEvent = false;
        this.selectedEvent = null;
        this.$refs.actionsDialog.hide();
        this.$refs.confirmDialog.hide();
      }
    },
    // returns a persian text of day number
    getDayText(day) {
      switch (day) {
        case 1:
          return "اول";
        case 2:
          return "دوم";
        case 3:
          return "سوم";
        case 4:
          return "چهارم";
        case 5:
          return "پنجم";
        case 6:
          return "ششم";
        case 7:
          return "هفتم";
        case 8:
          return "هشتم";
        case 9:
          return "نهم";
        case 10:
          return "دهم";
        case 11:
          return "یازدهم";
        case 12:
          return "دوازدهم";
        case 13:
          return "سیزدهم";
        case 14:
          return "چهاردهم";
      }
    },
    // Scrolls to current active event
    goToCurrentEvent() {
      let el = document.getElementById('currentEvent')
      el.scrollIntoView({block: 'center', behavior: 'smooth'})
    },
  },
  // Getter Properties
  computed: {
    //checks do we have any event that is active or not
    isAnyEventActive() {
      for (let e of this.events) {
        for (let ev of e.events) {
          if (ev.statusLookup === 3)
            return true;
        }
      }
      return false;
    },
    // return the first event that we can start
    getFirstStartableEvent() {
      for (let ev of this.events) {
        for (let e of ev.events) {
          if (e.statusLookup === 1) {
            return e;
          }
        }
      }
      return null;
    },
    //Returns Current Active Event
    getCurrentEvent() {
      for (let eArray of this.events) {
        for (let e of eArray.events) {
          if (e.statusLookup === 1 && e === this.getFirstStartableEvent && !this.isAnyEventActive)
            return e;
        }
      }
    },
  },
}
</script>

<style scoped>
* {
  scroll-behavior: smooth;
}
</style>

