<template>
  <q-page class="flow-page" v-if="formData">
    <div class="flow-page-heading">
      <div>
        <div class="flow-eyebrow">{{ formLeadId > 0 ? 'ویرایش رکورد' : 'رکورد جدید' }}</div>
        <h1 class="flow-page-title">{{ form && form.title }}</h1>
        <div class="flow-page-subtitle">اطلاعات را در فیلدهای فرم وارد کنید.</div>
      </div>
      <q-btn flat no-caps icon="arrow_forward" label="بازگشت به رکوردها" class="flow-back-button" :to="`/flow/${formName}`"/>
    </div>
    <div class="flow-surface flow-record-card">

      <!-- form title -->
      <div class="flow-record-fields">
      <div class="row q-col-gutter-lg items-center">

        <!-- fields -->
        <div v-for="(item, index) of layout" :class="`col-${item.w}`" :key="item.i">
          <f-form-property :property-id="formData[index].id" v-model:model-value="formData[index].value" :loading="isDataLoading"
                           @update:model-value="onInputProp"/>
        </div>



      </div>

      </div>

      <!-- actions -->
      <div class="flow-record-actions">

        <!-- custom actions -->
        <div v-for="action of customActions" class="col-auto">
          <q-btn class="full-width border-radius"
                 :style="{'background-color': `#${action && action.colorHex}66`, color: action && `#${action.colorHex}`}"
                 :label="action && action.title" unelevated/>
        </div>

        <!-- preset actions -->
        <div v-for="action of presetActions" class="col-auto">
          <q-btn class="full-width border-radius"
                 :style="{'background-color': `#${action && action.colorHex}66`, color: action && `#${action.colorHex}`}"
                 :label="action && action.title" unelevated/>
        </div>

        <!-- cancel -->
        <div class="col-auto">
          <q-btn class="flow-secondary-button full-width" label="انصراف"
                 :disable="isInProgress" unelevated :to="`/flow/${formName}`"/>
        </div>

        <!-- submit -->
        <div class="col-auto">
          <q-btn class="flow-action-primary full-width" :label="formLeadId > 0 ? 'ذخیره تغییرات' : 'ثبت رکورد'"
                 :loading="isInProgress" unelevated @click="submitForm()"/>
        </div>

      </div>
    </div>
    <q-dialog ref="similarDataDialog">
      <q-card flat>
        <q-card-section>
          <div class="text-center full-width text-bold">اطلاعات زیر مشابه اطلاعاتی است که قصد درج آنها را دارید</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="q-pa-none">
          <f-simple-data-grid :data="similarData" :form-name="formName" hide-header/>
        </q-card-section>
        <q-separator/>
        <q-card-actions class="row justify-end">
          <q-btn class="border-radius" color="cyan-2" text-color="cyan-7" label="ثبت با وجود تکرار"
                 :loading="isInProgress" unelevated @click="submitForm(true)"/>
          <q-btn class="border-radius" color="pink-2" text-color="pink-7" label="انصراف"
                 :loading="isInProgress" unelevated v-close-popup/>
        </q-card-actions>
      </q-card>

    </q-dialog>
  </q-page>
</template>

<script>
import FInput from "../../components/flow/FInput";
import FDropdown from "../../components/flow/FDropdown";
import FFormProperty from "../../components/flow/FFormProperty";
import FSimpleDataGrid from "../../components/flow/FSimpleDataGrid";

export default {
  name: "FormView",
  components: {FSimpleDataGrid, FFormProperty, FDropdown, FInput},
  data: () => ({
    formData: null,
    isDataLoading: true,
    isInProgress: false,
    similarData: []
  }),
  computed: {
    formName() {
      return this.$route.params.formName
    },
    formLeadId() {
      return +this.$route.params.formLeadId
    },
    presetActions() {
      return this.form?.actions.filter(action => action.name !== 'custom')
    },
    customActions() {
      return this.form?.actions.filter(action => action.name === 'custom')
    },
    form() {
      return this.$store.getters.getFormByName(this.formName)
    },
    layout() {
      if (this.form && this.form.layout)
        return JSON.parse(this.form.layout)?.sort((a, b) => {
          return a.i - b.i
        })
    }
  },
  methods: {
    onInputProp() {
      // console.log(this.formData)
    },
    async submitForm(forceInsert = false) {
      this.isInProgress = true
      let data = {}
      this.formData.forEach(item => {
        data[item.name] = item.value
      })
      const res = await this.$api.formProvider.submitForm(process.env.API_URL, this.formName, {
        id: this.formLeadId,
        checkForDuplicate: !forceInsert,
        data
      })
      console.log('res=>', res)
      this.isInProgress = false
      if (res.id > 0) {

        if (res.id !== this.formLeadId) {
          this.$q.notify({
            message: 'اطلاعات مورد نظر با موفقیت ثبت شد',
            color: 'positive'
          })
          await this.$router.replace(`/flow/${this.formName}/${res.id}`)
        } else {
          this.$q.notify({
            message: 'تغییرات مورد نظر با موفقیت اعمال شد',
            color: 'positive'
          })
        }
        this.$router.back()
      } else if (res.id == 0 && res.similarData != null) {
        this.similarData = res.similarData
        this.$refs.similarDataDialog.show()
      }
    },
    async loadForm() {
      this.isDataLoading = true
      const res = await this.$api.formProvider.getForm(process.env.API_URL, this.formName, this.formLeadId)
      this.formData.forEach(data => {
        data.value = res[data.name.pascalize()]
      })
      this.isDataLoading = false
    }
  },
  async beforeCreate() {
    if (!this.$store.state.forms || this.$store.state.forms.length <= 0) {
      await this.$store.dispatch("loadForms")
    }
  },
  async beforeMount() {
    if (!localStorage.getItem('forms')) {
      await this.$store.dispatch('loadForms')
    }
  },
  async mounted() {
    this.isDataLoading = true

    this.formData = this.form?.properties.map(item => ({
      index: item.layoutIndex,
      id: item.id,
      name: item.name,
      value: null
    }))
    if (this.formLeadId > 0) {
      await this.loadForm()
    }
    this.isDataLoading = false
  }
}
</script>

<style scoped>
.flow-record-card { max-width: 1050px; overflow: hidden; }
.flow-record-fields { padding: 28px; }
.flow-record-actions { display: flex; align-items: center; justify-content: flex-start; gap: 10px; padding: 16px 28px; border-top: 1px solid #e5e9f1; background: #fbfcfe; }
.flow-record-actions > div { min-width: 118px; }
.flow-secondary-button { background: #f0f2f7; color: #59657a; }
.flow-back-button { color: #59657a; }
@media (max-width: 600px) {
  .flow-record-fields { padding: 20px 16px; }
  .flow-record-actions { padding: 14px 16px; }
  .flow-record-actions > div { min-width: 0; flex: 1; }
}
</style>

