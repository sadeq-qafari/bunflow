<template>
  <div class="full-width border-radius border-solid q-pa-md">
    <div class="full-width q-gutter-y-md">

      <!-- header -->
      <div class="row full-width q-pl-md justify-between items-center">

        <!-- select all families, view options -->
        <!--        <div class="row col-2">-->

        <!-- select all families -->
        <div v-if="!isConfirmed" class="row col-auto q-pr-md items-center">
          <q-checkbox size="md" :model-value="totalAssignment" @update:model-value="setAllOptions" dense/>
        </div>

        <!--        </div>-->

        <!-- search -->
        <div :class="['row col q-gutter-x-md items-center', isConfirmed ? 'q-pl-md' : 'q-px-md']">

          <!-- family search -->
          <div class="col">
            <q-input v-model="familySearch" label="جستجوی پرونده" outlined dense/>
          </div>

          <!-- tag search -->
          <div class="col">
            <s-chips v-model="tagSearch" label="جستجوی برچسب" :url="`${baseUrl}/Tenant/Tag`" dense/>
          </div>

          <!-- area search -->
          <div class="col">
            <s-chips v-model="areaSearch" label="جستجوی منطقه" :url="`${baseUrl}/Base/Area`" dense/>
          </div>

        </div>

        <!-- save -->
        <div v-if="!isConfirmed" class="row col-auto items-center">
          <q-btn class="border-radius" color="teal-11" text-color="teal-14" label="ذخیره"
                 unelevated
                 :disable="!hasPermissionToSave"
                 @click="submitAssignments"/>
        </div>

      </div>

      <q-separator/>

      <!-- families -->
      <q-scroll-area class="scroll-area-height rounded-borders q-pr-lg overflow-hidden"
                     :thumb-style="scrollbarThumbStyle" visible>
        <div class="q-gutter-y-md">
          <q-intersection
            v-for="family of filteredFamilies"
            class="intersection"
            tag="div" :key="JSON.stringify(family)"
          >
            <div
              :class="['row full-width border-radius bg-grey-2 items-center', isConfirmed ? 'justify-between' : undefined]">

              <!-- select -->
              <div class="col-3">

                <!-- assigned and submitted -->
                <q-checkbox v-if="family.isAssigned" :model-value="true" class="q-pa-md" color="grey"
                            :label="`${family.familyTitle} (${family.familyMembersCount})`"
                            dense/>

                <!-- newly assigned -->
                <q-checkbox v-else v-model="newSelectedFamilies" class="q-pa-md" :val="family.familyId"
                            :label="`${family.familyTitle} (${family.familyMembersCount})`" @update:model-value="checkSelectedFamily"
                            :disable="isConfirmed" dense/>

              </div>

              <q-separator vertical inset/>

              <!-- tags -->
              <div class="row col-3 q-px-md items-center">

                <!-- icon -->
                <q-icon name="tag" size="sm" color="pink-13"/>

                <!-- tags -->
                <div class="q-ml-md text-subtitle2 text-weight-regular text-grey-8">
                  {{ family.tagTitles && family.tagTitles.length > 0 ? family.tagTitles : 'ندارد' }}
                </div>

              </div>

              <q-separator vertical inset/>

              <!-- areas -->
              <div class="row col-3 q-px-md items-center">

                <!-- icon -->
                <q-icon name="place" size="sm" color="amber-13"/>

                <!-- areas -->
                <div class="q-ml-md text-subtitle2 text-weight-regular text-grey-8">
                  {{ family.areaTitles && family.areaTitles.length > 0 ? family.areaTitles : 'نامشخص' }}
                </div>

              </div>

              <q-separator
                v-show="!isConfirmed"
                v-if="selectedFamilies.find(x => x === family.familyId) !== undefined || newSelectedFamilies.find(x => x === family.familyId) !== undefined"
                vertical
                inset/>

              <!-- assigned but not submitted -->
              <div v-show="!isConfirmed" v-if="!family.isAssigned && checkAssigned(family.familyId)"
                   class="row col q-px-md items-center">

                <!-- assigned items, manual assignment -->
                <q-btn class="full-width border-radius" color="teal-13" text-color="white" unelevated
                       dense @click="openAssignmentDialog(family)">
                  <template v-slot:default>
                    <div class="single-line-clamp text-subtitle2 text-weight-regular">
                      {{ getAssignedItems(family.familyId) }}
                    </div>
                  </template>
                </q-btn>


              </div>

              <!-- assigned and submitted -->
              <div v-show="!isConfirmed" v-if="family.isAssigned"
                   class="row col q-px-md q-gutter-x-md items-center">

                <!-- manual assignment -->
                <div class="col">
                  <q-btn class="full-width border-radius" color="cyan-2" text-color="cyan-7" icon="edit"
                         unelevated dense @click="openAssignmentDialog(family)"/>
                </div>

                <!-- undo assignment -->
                <div class="col">
                  <q-btn class="full-width border-radius" color="pink-2" text-color="pink-7" icon="delete" unelevated
                         dense/>
                </div>

              </div>

            </div>
          </q-intersection>
        </div>
      </q-scroll-area>

      <q-separator/>

      <!-- selections count -->
      <div class="row full-width justify-between">
        <div class="row col-5 q-gutter-x-md">
          <div class="q-pr-md text-subtitle1 text-weight-regular text-grey-8">فیلتر:</div>
          <q-btn v-for="option of filterOptions"
                 class="col border-radius text-subtitle2 text-weight-regular q-px-sm"
                 :unelevated="option.value === selectedFilter" :flat="option.value !== selectedFilter"
                 color="cyan" :label="option.label" dense @click="selectedFilter = option.value"/>
        </div>
        <div class="row col-5 justify-between">
          <!-- selected -->
          <div class="row q-col-gutter-x-sm">

            <!-- label -->
            <div class="text-subtitle1 text-weight-regular text-grey-8">
              انتخاب شده:
            </div>

            <!-- value -->
            <div class="text-subtitle1 text-weight-regular text-grey-9">
              {{ selectedFamiliesCount }}
            </div>

          </div>

          <!-- non-selected -->
          <div v-if="newSelectedFamilies.length === 0" class="row q-col-gutter-x-sm">

            <!-- label -->
            <div class="text-subtitle1 text-weight-regular text-grey-8">
              انتخاب نشده:
            </div>

            <!-- value -->
            <div class="text-subtitle1 text-weight-regular text-grey-9">
              {{ families.length - selectedFamilies.length }}
            </div>

          </div>

          <!-- all -->
          <div v-if="newSelectedFamilies.length === 0" class="row q-col-gutter-x-sm">

            <!-- label -->
            <div class="text-subtitle1 text-weight-regular text-grey-8">
              کل:
            </div>

            <!-- value -->
            <div class="text-subtitle1 text-weight-regular text-grey-9">
              {{ families.length }}
            </div>
          </div>
        </div>
      </div>

      <!-- manual assignment dialog -->
      <q-dialog v-model="manualAssignment">
        <div v-if="dialogData" class="column dialog-medium bg-white">

          <!-- header -->
          <div class="row full-width q-pa-sm justify-between items-center">

            <!-- icon, title -->
            <div class="row items-center">

              <!-- icon -->
              <QIcon name="tune" size="sm" color="primary"/>

              <!-- title -->
              <div class="q-ml-md text-subtitle1 text-weight-regular text-grey-9">
                تخصیص دستی اقلام
              </div>

            </div>

            <!-- close dialog -->
            <q-btn icon="close" color="red-2" text-color="red-7" unelevated dense
                   @click="manualAssignment = false"/>

          </div>

          <q-separator/>

          <!-- items header -->
          <div class="row full-width q-pa-sm items-center">

            <!-- product -->
            <div class="row col">
              <div class="text-subtitle2 text-black">
                محصول
              </div>
            </div>

            <!-- project / donation -->
            <div class="row col justify-center">
              <div class="text-subtitle2 text-black">
                پویش / اهدایی
              </div>
            </div>

            <!-- remaining quantity -->
            <div class="row col justify-center">
              <div class="text-subtitle2 text-black">
                باقی‌مانده
              </div>
            </div>

            <!-- assigned quantity -->
            <div class="row col justify-end">
              <div class="text-subtitle2 text-black">
                تخصیص‌داده‌شده
              </div>
            </div>

          </div>

          <!-- body -->
          <div class="column full-width">
            <div v-for="(item, index) of packItems" class="full-width" :key="JSON.stringify(item)">

              <!-- separator -->
              <q-separator/>

              <div class="row full-width q-py-sm items-center">

                <!-- product -->
                <div class="row col q-px-sm">
                  <div class="single-line-clamp text-subtitle2 text-weight-regular text-grey-9">
                    {{ item.productTitle }}
                  </div>
                </div>

                <!-- project / donation -->
                <div class="row col q-px-sm justify-center">
                  <div class="single-line-clamp text-subtitle2 text-weight-regular text-grey-9">
                    {{ item.isDonation ? ('اهدایی ' + item.donationTitle) : ('پویش ' + item.projectTitle) }}
                  </div>
                </div>

                <!-- remaining quantity -->
                <div class="row col q-px-sm justify-center">
                  <div class="text-subtitle2 text-weight-bolder text-black">
                    {{ item.totalQuantity ? (item.totalQuantity - item.assignedQuantity) : 'نامشخص' }}
                  </div>
                </div>

                <!-- assignment -->
                <div class="row col q-px-sm justify-end">
                  <q-input class="input-quantity" :model-value="getDialogItemValue(item.id)"
                           @update:model-value="setDialogItemValue(item.id, $event)"
                           input-class="text-center"
                           style="height: 25px" borderless rounded dense>

                    <template v-slot:prepend>
                      <q-btn class="btn-increase-decrease" size="10px" icon="add" color="cyan-2"
                             text-color="cyan-7" unelevated dense
                             @click="quantityChanged = true; setDialogItemValue(item.id, Math.round(getDialogItemValue(item.id) + 1))"/>
                    </template>

                    <template v-slot:append>
                      <q-btn class="btn-increase-decrease" size="10px" icon="remove" color="cyan-2"
                             text-color="cyan-7" :disable="getDialogItemValue(item.id) === 0" unelevated round dense
                             @click="quantityChanged = true; setDialogItemValue(item.id, Math.round(getDialogItemValue(item.id) - 1))"/>
                    </template>

                  </q-input>
                </div>

              </div>

            </div>
          </div>

          <q-separator/>

          <!-- footer -->
          <div class="row full-width q-pa-sm justify-end items-center">
            <div class="col-3">
              <q-btn class="full-width" color="green-2" text-color="green-7" label="ثبت" :disable="!quantityChanged"
                     unelevated dense @click="saveDialogData(currentFamilyId)"/>
            </div>
          </div>

        </div>
      </q-dialog>

    </div>

  </div>
</template>

<script>
import SChips from "../shared/SChips";

export default {
  name: "SupportPackDetailFamilySet",
  components: {SChips},
  props: {
    supportPackId: Number | null,
    packItems: Array | null,
    isConfirmed: {
      type: Boolean | null,
      default: false
    }
  },
  data: () => ({
    baseUrl: process.env.API_URL,
    currentFamilyId: null,
    edit: true,
    manualAssignment: false,
    quantityChanged: false,
    selectedFilter: 1,
    familySearch: '',
    scrollbarThumbStyle: {
      width: '10px',
      borderRadius: '10px',
      backgroundColor: '#9E9E9E'
    },
    tagSearch: [],
    areaSearch: [],
    families: [],
    selectedFamilies: [],
    newSelectedFamilies: [],
    specificSelectedItems: [],
    dialogData: [],
    filterOptions: [
      {label: 'همه', value: 1},
      {label: 'بدون تخصیص', value: 2},
      {label: 'تخصیص داده شده', value: 3}
    ]
  }),
  computed: {
    filteredFamilies() {
      let list = this.families
      if (this.selectedFilter === 2)
        list = list.filter(x => !x.isAssigned)
      if (this.selectedFilter === 3)
        list = list.filter(x => x.isAssigned)
      if (this.familySearch && this.familySearch.length > 0)
        list = list.filter(x => x.familyTitle.includes(this.familySearch))
      if (this.tagSearch && this.tagSearch.length > 0)
        list = list.filter(x => x.tagIds?.some(y => this.tagSearch.includes(y)))
      if (this.areaSearch && this.areaSearch.length > 0)
        list = list.filter(x => x.areaIds?.some(y => this.areaSearch.includes(y)))
      return list
    },
    totalAssignment() {
      let res = null
      if (this.filteredFamilies.filter(x => !x.isAssigned).every(x => this.newSelectedFamilies.includes(x.familyId))) res = true
      if (this.filteredFamilies.filter(x => !x.isAssigned).every(x => !this.newSelectedFamilies.includes(x.familyId))) res = false
      return res
    },
    selectedFamiliesCount() {
      if (this.newSelectedFamilies.length > 0) {
        return this.newSelectedFamilies.length
      } else {
        return this.selectedFamilies.length
      }
    },
    hasPermissionToSave() {
      return this.newSelectedFamilies.length !== 0
    }
  },
  methods: {
    checkSelectedFamily(familyIds) {
      if (familyIds.length > 0)
        for (let i = 0; i < this.specificSelectedItems.length;) {
          if (!familyIds.includes(this.specificSelectedItems[i].familyId)) {
            this.specificSelectedItems.splice(i, 1)
          } else i++
        }
      else this.specificSelectedItems = []
    },
    getAssignedItems(familyId) {
      if (this.specificSelectedItems.length > 0 && this.specificSelectedItems.find(x => x.familyId === familyId)) {
        let items = []
        this.specificSelectedItems.filter(x => x.familyId === familyId).forEach(x => {
          let productTitle = this.packItems.find(y => y.id === x.supportPackDetailId).productTitle
          if (productTitle)
            items.push(`${x.quantity} ${productTitle}`)
          else
            items.push(`${this.packItems.find(y => y.id === x.supportPackDetailId).unitPrice.toNumber()} × ${x.quantity}`)
        })
        return items.join('، ')
      } else return this.packItems.map(x => (x.productTitle ? `${x.quantity} ${x.productTitle}` : `${x.unitPrice.toNumber()} × ${x.quantity}`)).join(', ')
    },
    async saveDialogData(familyId) {
      if (this.filteredFamilies.find(x => x.familyId === familyId && x.isAssigned === true)) {
        await this.$axios.put(`${process.env.API_URL}/charity/supportPackFamily`, {
          supportPackId: this.supportPackId,
          familyId: familyId,
          Items: this.dialogData.map(x => ({
            id: x.supportPackDetailFamilyId,
            supportPackDetailId: x.id,
            quantity: x.quantity
          }))
        })
      } else {
        this.dialogData.forEach(item => {
          let i = this.specificSelectedItems
            .findIndex(x => x.supportPackDetailId === item.id && x.familyId === familyId)
          if (i >= 0) {
            this.specificSelectedItems[i].quantity = +item.quantity
          } else {
            this.specificSelectedItems.push({
              familyId,
              supportPackDetailId: +item.id,
              quantity: +item.quantity
            })
          }
        })
      }
      this.quantityChanged = false
      this.manualAssignment = false
      this.currentFamilyId = null
      this.$emit('reloadDetailItems')
    },
    async openAssignmentDialog(family) {
      this.currentFamilyId = family.familyId
      if (family.isAssigned) {
        const res = await this.$axios.get(`${process.env.API_URL}/charity/supportPackFamily/info`, {
          params: {
            familyId: family.familyId,
            supportPackId: this.supportPackId
          }
        })
        this.dialogData = res.data.result.items.map(x => ({
          id: x.supportPackDetailId,
          quantity: x.quantity,
          supportPackDetailFamilyId: x.id
        }))
      } else {
        this.dialogData = this.getDialogData(family.familyId)
      }
      this.manualAssignment = true
    },
    getDialogItemValue(supportPackDetailId) {
      return this.dialogData.find(x => x.id === supportPackDetailId)?.quantity || 0
    },
    setDialogItemValue(supportPackDetailId, value) {
      console.log('setDialogItemValue: ', this.dialogData, supportPackDetailId, value)
      let i = this.dialogData.findIndex(x => x.id === supportPackDetailId)
      if (i < 0) {
        this.dialogData.push({
          id: supportPackDetailId,
          quantity: value,
          supportPackDetailFamilyId: 0
        })
      } else {
        this.dialogData[i].quantity = value
      }

    },
    getDialogData(familyId) {
      let items = JSON.parse(JSON.stringify(this.packItems.map(x => ({
        id: x.id,
        quantity: x.quantity
      }))))
      let familyItems = this.specificSelectedItems.filter(x => x.familyId === familyId)
      if (familyItems && familyItems.length > 0) {
        return familyItems.map(x => ({id: x.supportPackDetailId, quantity: x.quantity}))
      } else {
        return items
      }
    },
    async loadFamiliesWithAssignment() {
      const res = await this.$axios.get(`${process.env.API_URL}/charity/supportPackFamily/familiesWithAssignment`, {
        params: {
          supportPackId: this.supportPackId
        }
      })
      this.families = res.data.result
      this.selectedFamilies = this.families.filter(x => x.isAssigned).map(x => x.familyId)
    },
    checkAssigned(familyId) {
      return this.newSelectedFamilies.find(x => x === familyId) !== undefined
    },
    async submitAssignments() {
      let items = this.specificSelectedItems.map(item => ({
        familyId: item.familyId,
        isFullyAssigned: false,
        supportPackDetailId: item.supportPackDetailId,
        quantity: item.quantity
      })) || []

      this.newSelectedFamilies.forEach(familyId => {
        let i = items.findIndex(x => x.familyId === familyId)
        if (i === -1) {
          items.push({
            familyId: familyId,
            isFullyAssigned: true,
            supportPackDetailId: null,
            quantity: null
          })
        }
      })

      await this.$axios.post(`${process.env.API_URL}/charity/supportPackFamily/insert`, {
        supportPackId: this.supportPackId,
        items
      })

      this.newSelectedFamilies = []
      this.specificSelectedItems = []
      await this.loadFamiliesWithAssignment()
      this.$emit('reloadDetailItems')
    },
    selectAllFamilies() {
      this.filteredFamilies.filter(x => this.newSelectedFamilies.findIndex(y => y === x.familyId) === -1).forEach(z => {
        this.newSelectedFamilies.push(z.familyId)
      })
    },
    setAllOptions(event) {
      if (event) {
        this.filteredFamilies.filter(x => !x.isAssigned).forEach(x => {
          if (!this.newSelectedFamilies.includes(x.familyId))
            this.newSelectedFamilies.push(x.familyId)
        })
      } else {
        this.filteredFamilies.filter(x => !x.isAssigned).forEach(x => {
          if (this.newSelectedFamilies.includes(x.familyId)) {
            let i = this.newSelectedFamilies.findIndex(y => y === x.familyId)
            this.newSelectedFamilies.splice(i, 1)
            for (let j = 0; j < this.specificSelectedItems.length;) {
              if (this.specificSelectedItems[j].familyId === x.familyId) {
                this.specificSelectedItems.splice(i, 1)
              } else j++
            }
          }
        })
      }
    }
  },
  async mounted() {
    await this.loadFamiliesWithAssignment()
    console.dir([...this.packItems])
  }
}
</script>

<style scoped>
.border-solid {
  border: 1px solid lightgrey;
}

.btn-increase-decrease {
  border-radius: 8px
}

.dialog-medium {
  min-width: 700px !important;
}

.input-quantity {
  width: 120px;
}

.intersection {
  width: 100%;
  min-height: 30px;
}

.scroll-area-height {
  height: 500px;
}
</style>

