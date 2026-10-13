<template>
  <q-card class="row q-pb-sm" flat>
    <q-card-section class="col-12 row justify-between items-center q-py-sm">
      <div class="text-bold">{{ label }}</div>
      <div>
        <q-btn unelevated class="border-radius" color="green-1" text-color="green" icon="add" label="افزودن" @click="addRow"/>
      </div>

    </q-card-section>
    <q-separator inset=""/>
    <q-card-section :class="['row q-pb-none',twoColumn?'col-6':'col-12']" v-for="(item,i) of list" :key="`contact-${i}`">
      <div class="col-4">
        <q-input class="col" dense outlined label="عنوان" :model-value="item.title" @update:model-value="onInput('title',$event,i)"
                 :rules="[val => !!val || (!!val && !!item.value) || (!val && !item.value) || 'اطلاعات تماس را وارد کنید']"
                 ref="titleInput"/>
      </div>
      <div class="col">
        <q-input class="col q-px-xs" dir="ltr" dense outlined label="شماره تماس/ایمیل/آدرس/..." :model-value="item.value"
                 ref="valueInput"
                 @update:model-value="onInput('value',$event,i)"
                 :rules="[val => !!val || (!!val && !!item.title) || (!val && !item.title) || 'اطلاعات تماس را وارد کنید']"/>
      </div>
      <div class="col-auto row q-pb-md q-mb-xs">
        <q-btn class="col " unelevated dense color="red-1" text-color="red" icon="close" @click="deleteRow(i)"/>
      </div>

    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: "ContactList",
  data: () => ({}),
  props: {
    value: Array | null,
    label: String,
    twoColumn: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    list() {
      return JSON.parse(JSON.stringify(this.value || [{}]))
    }
  },
  methods: {

    onInput(key, event, i) {
      let list = JSON.parse(JSON.stringify(this.list || []))
      list[i][key] = event
      this.$emit('input', list)

      this.$refs.titleInput.forEach(x => {
        x.resetValidation()
      })
      this.$refs.valueInput.forEach(x => {
        x.resetValidation()
      })
      setTimeout(() => {
        this.$refs.titleInput.forEach(x => {
          x.validate()
        })
        this.$refs.valueInput.forEach(x => {
          x.validate()
        })
      }, 100)
    },
    addRow() {
      let list = JSON.parse(JSON.stringify(this.list || []))
      list.push({title: '', value: ''})
      this.$emit('input', list)
    },
    deleteRow(i) {
      let list = JSON.parse(JSON.stringify(this.list || []))
      list.splice(i, 1)
      this.$emit('input', list)
    }
  },
  mounted() {

  }
}
</script>

<style scoped>

</style>

