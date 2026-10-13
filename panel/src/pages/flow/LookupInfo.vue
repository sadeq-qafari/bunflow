<template>
  <q-page class="q-pa-md">
    <!-- header -->
    <div class="row full-width border-radius bg-white q-pa-md justify-between items-center">

      <!-- title -->
      <div class="text-subtitle1 text-black">
        لیست
        {{ id > 0 ? lookup && lookup.title : ' جدید' }}
      </div>

      <!-- controls -->
      <div class="row col-4 q-gutter-x-md items-center">

        <!-- submit -->
        <div class="col">
          <q-btn class="full-width border-radius" color="cyan-2" text-color="cyan-7" label="ذخیره" unelevated
                 @click="submit"/>
        </div>

        <!-- return -->
        <div class="col">
          <q-btn class="full-width border-radius" color="pink-2" text-color="pink-7" label="بازگشت" unelevated
                 @click="$navigateBack"/>
        </div>

      </div>

    </div>

    <div class="row full-width justify-between items-center border-radius bg-white q-pa-md q-mt-md">
      <div class="col-12 row">
        <div class="col-3">
          <q-option-group
            v-model="lookup.typeLookup"
            :options="[{label: 'گزینه‌های مشخص',value: 1},{label: 'اسکریپت',value: 2}]"
            color="primary"
            inline
          />
        </div>
        <div class="col-3 q-px-xs">
          <q-input v-model="lookup.title" label="عنوان" dense outlined ref="lookupTitle"
                   :rules="[val=>!!val || 'عنوان به درستی مشخص نشده است']"/>
        </div>
        <div class="col-6">
          <q-input v-model="lookup.description" label="توضیحات" dense outlined/>
        </div>
      </div>
      <div class="col-12">
        <div v-if="lookup.typeLookup==2">
          <s-code-editor label="کوئری" v-model="lookup.query" class="q-mt-md"/>
        </div>
        <div v-if="lookup.typeLookup==1" class="column">
          <div class="row justify-between q-mt-md items-center">
            <div class="text-subtitle1">گزینه ها</div>
            <q-btn class="border-radius" color="cyan-2" text-color="cyan-7" label="افزودن ردیف" unelevated
                   @click="addItem"/>
          </div>
          <q-markup-table dense bordered separator="cell" flat class="q-mt-md">
            <thead>
            <tr>
              <th class="text-center">ترتیب</th>
              <th class="text-center">عنوان</th>
              <th class="text-center">مقدار</th>
              <th class="text-center">توضیحات</th>
              <th class="text-center">رنگ</th>
              <th class="text-center">آیکن</th>
              <th class="text-center">حذف</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item,index) of lookup.items">
              <td class="text-center row no-padding items-center full-height">
                <div class="col-4 column justify-around ">
                  <q-btn class="row" @click="moveItem(item,-1)" padding="0" flat icon="expand_less" dense/>
                  <q-btn class="row" @click="moveItem(item,+1)" padding="0" flat icon="expand_more" dense/>
                </div>
                <div class="col-8 column justify-center">
                  <div>{{ index + 1 }}</div>
                </div>
              </td>
              <td :class="['text-center',!item.title?'error-cell':undefined]">
                <q-input v-model="item.title" dense borderless/>
              </td>
              <td :class="['text-center',!(item.value>0)?'error-cell':undefined]">
                <q-input v-model="item.value" dense borderless/>
              </td>
              <td class="text-center">
                <q-input v-model="item.description" dense borderless/>
              </td>
              <td class="text-center">
                <f-color-picker dense borderless flat v-model="item.colorHex"/>
              </td>
              <td class="text-center">
                <q-input v-model="item.icon" dense borderless>
                  <template v-slot:append>
                    <q-btn flat icon="link" dense @click="openIconLibrary"/>
                  </template>
                  <template v-slot:prepend>
                    <q-icon :name="item.icon"/>
                  </template>
                </q-input>
              </td>
              <td class="text-center">
                <q-btn flat icon="delete" color="pink" @click="deleteItem(index)" dense/>
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import SCodeEditor from "../../components/shared/SCodeEditor";
import FColorPicker from "../../components/flow/FColorPicker";

export default {
  name: "LookupInfo",
  components: {FColorPicker, SCodeEditor},
  data: () => ({
    lookup: {
      typeLookup: 1,
      title: '',
      description: '',
      items: [{
        title: '',
        description: '',
        icon: '',
        color: '',
        value: null
      }]
    }
  }),
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  methods: {
    isValid() {

      let isValid = true
      let errors = []
      if (!this.$refs.lookupTitle.validate()) {
        isValid = false
        errors.push('عنوان به درستی مشخص نشده است')
      }
      if (this.lookup.typeLookup == 1) {
        if (this.lookup.items.length < 1) {
          isValid = false
          errors.push('تعریف حداقل یک ردیف از گزینه ها الزامی است')
        }
        this.lookup.items.forEach((item, index) => {
          if (!item.title || !(item.value > 0)) {
            isValid = false
            errors.push(`${'گزینه ردیف'} ${index + 1} ${'به درستی مشخص نشده است'}`)
          }
        })
      }
      errors.forEach(err => {
        this.$q.notify({
          message: err,
          type: 'negative'
        })
      })
      return isValid
    },
    async submit() {
      if (this.isValid()) {
        const res = await this.$axios.post(`${process.env.API_URL}/flow/lookup/upsert`, Object.assign({}, this.lookup, {id: this.id}))
        if (process.env.FLOW_STANDALONE) await this.$store.dispatch('loadForms')
        if (this.id <= 0) {
          await this.$router.replace({path: this.$route.path, query: {...this.$route.query, id: res.data.result}})
        }
      }
    },
    async load() {
      const res = await this.$axios.get(`${process.env.API_URL}/flow/lookup/${this.id}`)
      this.lookup = res.data.result
    },
    addItem() {
      if (!this.lookup.items) {
        this.lookup.items = []
        this.lookup = {...this.lookup}
      }
      this.lookup.items.push({})
      console.log(this.lookup.items)
    },
    deleteItem(index) {
      this.lookup.items.splice(index, 1)
    },
    openIconLibrary() {
      window.open('https://fonts.google.com/icons?selected=Material+Icons', '_blank')
    },
    moveItem(item, order) {
      this.lookup.items.forEach((x, i) => {
        x.index = +i
      })
      item.index += order
      if (item.index < 0) {
        item.index = 0
      }
      if (item.index >= this.lookup.items.length) {
        item.index = this.lookup.items.length - 1
      }
      console.log(item.title, item.index)
      if (item.index >= this.lookup.items.length) {
        let k = item.index - this.lookup.items.length + 1;
        while (k--) {
          this.lookup.items.push(undefined);
        }
      }
      this.lookup.items.splice(item.index, 0, this.lookup.items.splice(item.index -= order, 1)[0]);
    }
  },
  mounted() {
    if (this.id > 0) {
      this.load()
    }
  }
}
</script>

<style scoped>
.error-cell {
  border-bottom: 1px solid red;
}
</style>

