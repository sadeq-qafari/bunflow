<template>
  <div class="row full-width">

    <!-- first list -->
    <div class="col-6 q-pr-sm">
      <div class="column full-width border-radius bg-white q-pa-md">

        <!-- header -->
        <div class="row full-width justify-between items-center">

          <!-- icon, title -->
          <div class="row items-center">

            <!-- icon -->
            <q-icon class="q-mr-md q-pa-xs border-radius bg-light-blue-13" :name="firstListIcon"
                    size="sm"
                    color="white"/>

            <!-- title -->
            <div class="text-subtitle1 text-black">
              {{ type && type.title }}
            </div>

          </div>

          <!-- total amount -->
          <div
            :class="['row border-radius q-px-md q-py-xs items-center', isBalanced ? 'bg-green-1 text-positive' : 'bg-red-1 text-red-13']">

            <!-- title -->
            <div class="q-mr-sm text-subtitle2 text-weight-regular">
              مبلغ کل:
            </div>

            <!-- total amount -->
            <div class="text-subtitle2 text-bold">
              {{ firstListTotalAmount.toMoney() }}
            </div>

          </div>

          <!-- add -->
          <q-btn-dropdown v-if="type && type.id === 3" class="border-radius text-weight-regular"
                          padding="4px 28px"
                          color="teal-13"
                          label="افزودن" align="between" unelevated dense>
            <q-list separator>
              <q-item v-for="item of itemOptions" class="q-pa-sm" tag="div" clickable dense v-close-popup
                      @click="addItem('firstList', item)" :key="JSON.stringify(item)">
                <div class="row full-width items-center">

                  <!-- icon -->
                  <q-icon :name="item.icon" size="sm" color="teal-14"/>

                  <!-- title -->
                  <div class="q-ml-md text-subtitle2 text-weight-regular text-teal-14">
                    {{ item.label }}
                  </div>

                </div>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn v-else class="col-2 border-radius text-weight-regular" color="teal-13"
                 label="افزودن" unelevated dense @click="addItem('firstList', {value: 5, label: type.title})"/>

        </div>

        <q-separator class="q-my-md"/>

        <!-- list -->
        <div class="column full-width q-gutter-y-md">

          <!-- if items don't exist -->
          <div v-if="details && details.length === 0 || details.filter(x => x.isCredit === true).length === 0"
               class="text-subtitle2 text-weight-regular text-black">
            موردی برای نمایش وجود ندارد
          </div>

          <!-- otherwise -->
          <div v-for="(item, i) of details.filter(x => x.isCredit === true)" :key="i">
            <draft-detail-item :value="item" @delete="deleteItem(item)" @input="saveItem(item, $event)"
                               :general-account-group-id="generalAccountGroupId"/>
          </div>

        </div>

      </div>
    </div>

    <!-- second list -->
    <div class="col-6 q-pl-sm">
      <div class="column full-width border-radius bg-white q-pa-md">

        <!-- header -->
        <div class="row full-width justify-between items-center">

          <!-- icon, title -->
          <div class="row items-center">

            <!-- icon -->
            <q-icon class="q-mr-md q-pa-xs border-radius bg-light-blue-13" :name="secondListIcon"
                    size="sm"
                    color="white"/>

            <!-- title -->
            <div class="text-subtitle1 text-black">
              {{ secondListTitle }}
            </div>

          </div>

          <!-- total amount -->
          <div
            :class="['row border-radius q-px-md q-py-xs items-center', isBalanced ? 'bg-green-1 text-positive' : 'bg-red-1 text-red-13']">

            <!-- title -->
            <div class="q-mr-sm text-subtitle2 text-weight-regular">
              مبلغ کل:
            </div>

            <!-- total amount -->
            <div class="text-subtitle2 text-bold">
              {{ secondListTotalAmount.toMoney() }}
            </div>

          </div>

          <!-- add -->
          <q-btn-dropdown class="border-radius text-weight-regular" padding="4px 28px"
                          color="teal-13"
                          label="افزودن" align="between" unelevated dense>
            <q-list separator>
              <q-item v-for="item of itemOptions" class="q-pa-sm" tag="div" clickable dense v-close-popup
                      @click="addItem('secondList', item)" :key="JSON.stringify(item)">
                <div class="row full-width items-center">

                  <!-- icon -->
                  <q-icon :name="item.icon" size="sm" color="teal-14"/>

                  <!-- title -->
                  <div class="q-ml-md text-subtitle2 text-weight-regular text-teal-14">
                    {{ item.label }}
                  </div>

                </div>
              </q-item>
            </q-list>
          </q-btn-dropdown>

        </div>

        <q-separator class="q-my-md"/>

        <!-- list -->
        <div class="column full-width q-gutter-y-md">

          <!-- if items don't exist -->
          <div v-if="details && details.length === 0 || details.filter(x => x.isCredit === false).length === 0"
               class="text-subtitle2 text-weight-regular text-black">
            موردی برای نمایش وجود ندارد
          </div>

          <!-- otherwise -->
          <div v-for="(item, i) of details.filter(x => x.isCredit === false)" :key="i">
            <draft-detail-item :value="item" @delete="deleteItem(item)" @input="saveItem(item,$event)"/>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script>
import DraftDetailItem from "./DraftDetailItem";

export default {
  name: "DraftDetails",
  components: {DraftDetailItem},
  props: {
    value: Array | null,
    type: Object | null,
  },
  data: () => ({
    itemOptions: [
      {label: 'بانک', icon: 'account_balance', value: 1},
      {label: 'شخص', icon: 'perm_identity', value: 2},
      {label: 'صندوق', icon: 'account_balance_wallet', value: 3},
      {label: 'تنخواه', icon: 'account_box', value: 4}
    ]
  }),
  computed: {
    details() {
      return this.value && JSON.parse(JSON.stringify(this.value)) || []
    },
    firstListIcon() {
      switch (this.type.id) {
        case 1:
          return 'payment'
        case 2:
          return 'savings'
        case 3:
          return 'account_balance'
        case 4:
          return 'attach_money'
        case 5:
          return 'savings'
        default:
          return 'info'
      }
    },
    secondListIcon() {
      let icon
      switch (this.type.id) {
        case 1:
          return 'account_balance'
        case 2:
          return 'account_balance'
        case 3:
          return 'credit_card'
        case 4:
          return 'account_balance'
        case 5:
          return 'account_balance'
      }
    },
    secondListTitle() {
      switch (this.type.id) {
        case 1:
          return 'از محل'
        case 2:
          return 'واریز به'
        case 3:
          return 'به'
        case 4:
          return 'از محل'
        case 5:
          return 'واریز به'
      }
    },
    firstListTotalAmount() {
      return this.details.filter(x => x.isCredit === true)?.map(x => x.amount).reduce((a, b) => a + b, 0) || 0
    },
    secondListTotalAmount() {
      return this.details.filter(x => x.isCredit === false)?.map(x => x.amount).reduce((a, b) => a + b, 0) || 0
    },
    isBalanced() {
      return this.firstListTotalAmount === this.secondListTotalAmount
    },
    generalAccountGroupId() {
      switch (this.type.id) {
        case 1:
          return 8
        case 2:
          return 6
        case 3:
          return undefined
        case 4:
          return undefined
        case 5:
          return undefined
        default:
          return undefined
      }
    },
  },
  methods: {
    addItem(list, type) {
      this.details.push({
        id: 0,
        typeLookup: type.value,
        typeLookupTitle: type.label,
        isCredit: list === 'firstList',
        amount: 0
      })
      this.$emit('input', this.details)
    },
    deleteItem(item) {
      let i = this.details.findIndex(x => x === item)
      this.details.splice(i, 1)
      this.$emit('input', this.details)
    },
    saveItem(item, e) {
      let i = this.details.findIndex(x => x === item)
      this.details[i] = e
      this.$emit('input', this.details)
    }
  }
}
</script>

<style scoped>
.border-radius {
  border-radius: 10px;
}
</style>

