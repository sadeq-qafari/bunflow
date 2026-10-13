<template>
  <q-page class="flow-page column">
    <div class="flow-page-heading">
      <div>
        <div class="flow-eyebrow">انتقال داده</div>
        <h1 class="flow-page-title">ورود اطلاعات به {{ form && form.title }}</h1>
        <div class="flow-page-subtitle">یک فایل Excel انتخاب کنید و ردیف‌های موردنظر را وارد کنید.</div>
      </div>
      <q-btn flat no-caps icon="arrow_forward" label="بازگشت به رکوردها" class="flow-back-button" :to="`/flow/${formName}`"/>
    </div>
    <q-card flat class="flow-surface flow-import-card">
      <q-card-section class="q-pa-none">
        <div class="q-pa-md q-gutter-sm">
          <q-banner inline-actions rounded class="bg-grey-2 text-grey-9">
            <div class="row justify-between">
              <div class="text-bold">
                درج اطلاعات در {{ form && form.title }}
              </div>

              <div class="bg-gray-2 text-center text-bold" v-if="forms">
              <span class="text-positive" v-if="selectedItemsCount>0">
                <span class="q-px-xs">{{ selectedItemsCount }}</span>
                <span>مورد انتخاب شده است</span>
              </span>
                <span class="text-red" v-else>اطلاعات موردنظر را انتخاب کنید</span>
              </div>
            </div>
            <template v-slot:action>
              <div class="rounded-borders overflow-hidden row" v-if="forms">
                <q-btn unelevated class="q-px-md no-margin flow-action-primary" padding="8px 16px"
                       :loading="isSubmitting" label="ثبت" @click="submit" :disabled="selectedItemsCount==0"/>
                <div class="q-px-xs"></div>
                <q-btn unelevated class="q-px-md no-margin flow-secondary-button" padding="8px 6px"
                       label="انصراف" @click="forms = null"/>
              </div>
              <div class="row" v-else>
                <div class="rounded-borders overflow-hidden q-mx-sm">
                  <q-file dense color="white" label-color="white" bg-color="positive" borderless v-model="file"
                          :display-value="file ? 'تغییر فایل' : 'انتخاب فایل'"
                          class="file-input-text-color q-px-sm bg-positive">
                    <template v-slot:prepend>
                      <q-icon color="white" name="attachment"/>
                    </template>
                    <template v-slot:append>
                      <q-separator vertical color="white" v-if="file"/>
                      <q-btn unelevated color="positive" text-color="white" icon="upload" label="آپلود" @click="upload"
                             :loading="isUploading" v-if="file"/>
                    </template>
                  </q-file>

                </div>
                <q-btn unelevated dense class="q-px-md no-margin" color="negative" label="بازگشت"
                       @click="$router.back()"/>
              </div>
            </template>
          </q-banner>
        </div>
      </q-card-section>
      <q-card-section class="row q-pa-none">
        <div v-for="(data,form) in forms" class="col-12">
          <f-simple-data-grid class="col" :form-name="form" :data="data" :show-checkbox="form==formName"
                              @setCheck="setCheck($event)"
                              @setTotalCheck="setTotalCheck($event)"/>

        </div>
      </q-card-section>
      <q-card-section>

        <div>
          <div class="text-bold">ابتدا فایل موردنظر را انتخاب کنید، فایل انتخابی باید شرایط زیر را دارا باشد:</div>
          <div>
            <ul>
              <li>
                فایل انتخابی باید اکسل باشد، یعنی دارای پسوند xls یا xlsx باشد.
              </li>
              <li>
                داده های موردنظر در شیت اول قرار داشته باشند
              </li>
              <li>
                عنوان شیت اکسل حتما به انگلیسی باشد (عنوان شیت به صورت فارسی فرایند خواندن فایل را مختل می کند)
              </li>
              <li>
                در ردیف اول در جدول باید عنوان ستون ها منطبق با ستون های تعریف شده در موجودیت موردنظر باشد
              </li>
            </ul>
          </div>
          <div class="text-bold">نمونه جدولی که در اکسل باید تعریف شده باشد:</div>
          <div>
              <div class="q-pa-md">
                <q-markup-table separator="cell" flat dense bordered>
                  <thead>
                  <tr>
                    <th class="text-center"></th>
                    <th class="text-center">A</th>
                    <th class="text-center">B</th>
                    <th class="text-center">C</th>
                    <th class="text-center">D</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td class="text-center">1</td>
                    <td class="text-center">نام</td>
                    <td class="text-center">نام خانوادگی</td>
                    <td class="text-center">شهر</td>
                    <td class="text-center">سن</td>
                  </tr>
                  <tr>
                    <td class="text-center">2</td>
                    <td class="text-center">احمد</td>
                    <td class="text-center">محمودی</td>
                    <td class="text-center">مشهد</td>
                    <td class="text-center">24</td>
                  </tr>
                  <tr>
                    <td class="text-center">3</td>
                    <td class="text-center">سلیمان</td>
                    <td class="text-center">رضوی</td>
                    <td class="text-center">مشهد</td>
                    <td class="text-center">29</td>
                  </tr>
                  <tr>
                    <td class="text-center">4</td>
                    <td class="text-center">حمید</td>
                    <td class="text-center">سعیدی</td>
                    <td class="text-center">تهران</td>
                    <td class="text-center">44</td>
                  </tr>
                  </tbody>
                </q-markup-table>
              </div>
          </div>
        </div>

      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import FSimpleDataGrid from "../../components/flow/FSimpleDataGrid";

export default {
  name: "FormImport",
  components: {FSimpleDataGrid},
  data: () => ({
    file: null,
    forms: null,
    isUploading: false,
    isSubmitting: false
  }),
  computed: {
    formName() {
      return this.$route.params.formName?.toString()
    },
    form() {
      return this.$store.getters.getFormByName(this.formName)
    },
    selectedItems() {
      let items = {}
      for (let formName in this.forms) {
        let formId = this.$store.getters.getFormByName(formName).id
        items[formId] = []
        this.forms[formName].forEach(item => {
          if (item.is_checked) {
            items[formId].push(item.Id)
          }
        })
      }
      return items
    },
    selectedItemsCount() {
      let count = 0
      if (this.selectedItems) {
        for (let key in this.selectedItems) {
          count += this.selectedItems[key].length
        }
      }
      return count
    }
  },
  methods: {
    upload() {
      console.log('selected file:', this.file)
      if (this.file == null) return
      this.isUploading = true;
      let data = new FormData()
      data.append('formData', (this.file))
      data.append('formName', `${this.formName}`)
      // @ts-ignore
      this.$axios.post(`${process.env.API_URL}/Flow/form/importExcel`, data, {noNotify: true}).then(res => {
        this.isUploading = false;
        this.file = null;
        if (res.data.success && res.data.result)
          this.forms = res.data.result.forms
        this.reference = res.data.result.reference
      }).catch(() => {
        this.file = null;
        this.isUploading = false;
        this.$q.notify({
          message: 'خطا در خواندن فایل',
          color: 'negative'
        })
      })
    },
    submit() {
      this.isSubmitting = true
      let data = {
        reference: this.reference,
        selectedItems: this.selectedItems,
        formId: this.form.id
      }
      this.$axios.post(`${process.env.API_URL}/Flow/form/batchInsert`, data, {noNotify: true}).then(res => {
        if (res.data.success) {
          this.$q.notify({
            message: 'اطلاعات با موفقیت درج شد',
            color: 'positive'
          })
          this.$router.back()
        }
        this.isSubmitting = false
      }).catch(() => {
        this.isSubmitting = false
        this.$q.notify({
          message: 'خطا در درج اطلاعات',
          color: 'negative'
        })
      })
    },
    setCheck(e) {
      this.forms[e.formName][e.index]['is_checked'] = e.value
      this.forms = {...this.forms}
    },
    setTotalCheck(e) {
      this.forms[e.formName].forEach((item, index) => {
        this.setCheck({
          value: e.value,
          id: item.Id,
          index: index,
          formName: e.formName
        })
      })
    }
  }
}
</script>

<style scoped>
.flow-import-card { overflow: hidden; }
.flow-import-card > .q-card__section { padding: 18px 20px; }
.flow-back-button { color: #59657a; }
</style>

<style lang="scss">
.file-input-text-color {

  .q-field__native {
    color: white !important;
    padding-right: 10px !important;
  }
}
</style>

