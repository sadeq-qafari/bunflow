<template>
  <div class="row full-width bg-grey-2 rounded-borders border-solid q-pa-md">

    <!-- header -->
    <div class="row full-width q-mb-md justify-between items-center">

      <!-- title, priority, status, due date -->
      <div class="row col q-pr-md q-gutter-x-md items-center">

        <!-- title -->
        <div class="col-4">

          <!-- edit -->
          <q-input v-if="edit" v-model="detailItem.title" bg-color="white" label="عنوان" outlined dense
                   @update:model-value="validate"/>

          <!-- view -->
          <div v-else class="row full-width items-center">

            <!-- title -->
            <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
              عنوان:
            </div>

            <!-- literally title -->
            <div class="col q-pl-md text-subtitle2 text-black single-line-clamp">

              {{ backupData && backupData.title }}

              <q-tooltip content-class="bg-grey-10 text-caption text-weight-regular text-white">
                {{ backupData && backupData.title }}
              </q-tooltip>

            </div>

          </div>

        </div>

        <!-- priority -->
        <div class="col">

          <!-- edit -->
          <s-auto-complete v-if="edit" v-model="detailItem.priorityLookup" :options="priorityLookupOptions"
                           bg-color="white"
                           label="اولویت" outlined dense @input="validate"/>

          <!-- view -->
          <div v-else class="row full-width items-center">

            <!-- title -->
            <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
              اولویت:
            </div>

            <!-- priority -->
            <div class="col q-pl-md text-subtitle2 text-black">
              {{
                backupData && backupData.priorityLookup ? priorityLookupOptions.find(x => x.value === backupData.priorityLookup).label : ''
              }}
            </div>

          </div>

        </div>

        <!-- status -->
        <div class="col">

          <!-- edit -->
          <s-auto-complete v-if="edit" v-model="detailItem.statusLookup" :options="statusLookupOptions" bg-color="white"
                           label="وضعیت" outlined dense @input="validate"/>

          <!-- view -->
          <div v-else class="row full-width items-center">

            <!-- title -->
            <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
              وضعیت:
            </div>

            <!-- status -->
            <div class="col q-pl-md text-subtitle2 text-black">
              {{
                backupData && backupData.statusLookup ? statusLookupOptions.find(x => x.value === backupData.statusLookup).label : ''
              }}
            </div>

          </div>

        </div>

        <!-- due date -->
        <div class="col">

          <!-- edit -->
          <s-date-picker v-if="edit" v-model="detailItem.dueDate" type="date" bg-color="white" label="تاریخ سند"
                         outlined dense/>

          <!-- view -->
          <div v-else class="row full-width items-center">

            <!-- title -->
            <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
              تاریخ تحویل:
            </div>

            <!-- due date -->
            <div class="col q-pl-md text-subtitle2 text-black">
              {{ backupData && backupData.dueDate && backupData.dueDate.toJalaliDate() }}
            </div>

          </div>

        </div>

      </div>

      <!-- controls -->
      <div class="row col-auto q-gutter-x-sm items-center">

        <!-- save, edit -->
        <div>

          <!-- save -->
          <q-btn v-if="edit" class="rounded-borders" size="12px" color="cyan-2" text-color="cyan-7" icon="check"
                 unelevated dense @click="save"/>

          <!-- edit -->
          <q-btn v-else class="rounded-borders" size="12px" color="cyan-2" text-color="cyan-7" icon="edit" unelevated
                 dense @click="editItem"/>

        </div>

        <!-- cancel, delete -->
        <div>

          <!-- cancel -->
          <q-btn v-if="edit" class="rounded-borders" size="12px" color="pink-2" text-color="pink-7" icon="close"
                 unelevated dense @click="cancelEdit"/>

          <!-- delete -->
          <q-btn v-else class="rounded-borders" size="12px" color="pink-2" text-color="pink-7" icon="delete" unelevated
                 dense @click="deleteItem"/>

        </div>

      </div>

    </div>

    <!-- body -->
    <div class="full-width">
      <div class="row full-width q-gutter-y-md">

        <!-- description -->
        <div class="col-12">

          <!-- edit -->
          <q-input v-if="edit" v-model="detailItem.description" bg-color="white" label="توضیحات" outlined dense
                   @update:model-value="validate"/>

          <!-- view -->
          <div v-else class="row full-width items-center">

            <!-- title -->
            <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
              توضیحات:
            </div>

            <!-- description -->
            <div class="col q-pl-md text-subtitle2 text-black">
              {{ backupData && backupData.description }}
            </div>

          </div>

        </div>

        <!-- task responsible people -->
        <div class="col-12">

          <!-- edit -->
          <s-chips v-if="edit" :value="detailItem.responsibles && detailItem.responsibles.map(x => x.value)"
                   class="full-width"
                   :url="`${baseUrl}/tenant/person`"
                   bg-color="white" label="مسئولین" dense @inputItem="detailItem.responsibles=$event"/>

          <!-- view -->
          <div v-else class="row full-width items-center">

            <!-- title -->
            <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
              مسئولین:
            </div>

            <!-- task responsible people -->
            <div class="col q-pl-md text-subtitle2 text-black">
              {{
                backupData && backupData.responsibles ? backupData.responsibles.map(x => x.label.trim()).join('، ') : ''
              }}
            </div>

          </div>

        </div>

      </div>
    </div>

    <!-- validation errors -->
    <div v-if="edit && validation && hasErrors"
         class="animated fadeInDown row full-width rounded-borders bg-red-1 q-mt-md q-pa-sm items-start">

      <!-- icon -->
      <q-icon class="col-auto" name="privacy_tip" size="sm" color="red-13"/>

      <!-- error -->
      <div class="col q-pl-sm text-subtitle2 text-weight-regular text-red-13">
        {{ error }}
      </div>

    </div>

  </div>
</template>

<script>
import SAutoComplete from "../shared/SAutoComplete";
import SDatePicker from "../shared/SDatePicker";
import SChips from "../shared/SChips";

export default {
  name: "MeetingTaskItem",
  components: {SAutoComplete, SDatePicker, SChips},
  props: {
    value: Object | null
  },
  data: () => ({
    baseUrl: process.env.API_URL,
    detailItem: null,
    backupData: null,
    error: null,
    edit: false,
    validation: false,
    hasErrors: false,
    priorityLookupOptions: [
      {label: 'فوری', value: 1},
      {label: 'مهم', value: 2},
      {label: 'عادی', value: 3}
    ],
    statusLookupOptions: [
      {label: 'در انتظار بررسی', value: 1},
      {label: 'در حال انجام', value: 2},
      {label: 'نیاز به بررسی', value: 3},
      {label: 'انجام شده', value: 4}
    ]
  }),
  methods: {
    async validate() {
      this.hasErrors = false
      let errors = []

      // title
      if (!(this.detailItem.title && this.detailItem.title.length > 0)) {
        this.hasErrors = true
        errors.push('عنوان')
      }

      // priority
      if (!this.detailItem.priorityLookup) {
        this.hasErrors = true
        errors.push('اولویت')
      }

      // status
      if (!this.detailItem.statusLookup) {
        this.hasErrors = true
        errors.push('وضعیت')
      }

      // description
      if (!(this.detailItem.description && this.detailItem.description.length > 0)) {
        this.hasErrors = true
        errors.push('توضیحات')
      }

      switch (errors.length) {
        case 1 :
          this.error = errors[0]
          break;
        case 2:
          this.error = errors.join(' و ')
          break;
        default:
          this.error = errors.slice(0, errors.length - 1).join('، ') + ' و ' + errors[errors.length - 1]
      }

      this.error += ' به درستی وارد نشده است.'
    },
    async save() {
      await this.validate()
      if (!this.hasErrors) {
        this.$emit('input', this.detailItem)
        this.backupData = this.detailItem && JSON.parse(JSON.stringify(this.detailItem)) || {}
        this.edit = false
      } else {
        this.validation = true
      }
    },
    cancelEdit() {
      this.edit = false
    },
    editItem() {
      this.edit = true
    },
    deleteItem() {
      this.$emit('delete', this.backupData)
    }
  },
  beforeMount() {
    this.detailItem = this.value && JSON.parse(JSON.stringify(this.value)) || {}
  },
  mounted() {
    this.backupData = this.detailItem && JSON.parse(JSON.stringify(this.detailItem)) || {}
    if (!(this.detailItem.id > 0)) {
      this.edit = true
    }
  }
}
</script>

<style scoped>
.border-solid {
  border: 1px solid lightgrey;
}
</style>

