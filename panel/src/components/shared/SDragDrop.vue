<template>
  <div class="row justify-between q-pa-sm no-select">

    <!----SOURCE---->
    <q-card class="col flex row border-grey" flat>

      <!--HEADER-->
      <q-card-section class="col-12 q-pa-sm row justify-between">
        <slot name="source-header">
          <div class="text-bold">
            اقلام
          </div>
        </slot>
      </q-card-section>
      <q-separator/>

      <!--ITEMS-->
      <q-card-section class="col-12 q-pa-sm droppable" style="min-height: 100px"
                      @dragenter="onDragEnter"
                      @dragleave="onDragLeave"
                      @dragover="onDragOver"
                      @drop="onDrop('remove',$event)">
        <q-card v-for="item of options" flat
                :id="item[keyName]"
                draggable="true"
                @dragstart="onDragStart"
                class="row justify-center items-center  cursor-pointer float-left q-ma-xs" :key="JSON.stringify(item)">
          <slot v-bind:item="item">
            <q-chip color="white" v-for="(v,k) in item" v-if="k!=keyName" :key="JSON.stringify({v,k})">{{ v }}</q-chip>
          </slot>
        </q-card>
      </q-card-section>

      <!--FOOTER-->
      <slot name="source-footer"/>
    </q-card>

    <q-card flat class="col-auto bg-transparent row justify-center items-center">
      <q-icon class="col-12" name="sync_alt" size="xl" color="grey-4"/>
    </q-card>

    <!----TARGET---->
    <q-card class="col flex row border-grey" flat>

      <!--HEADER-->
      <q-card-section class="col-12 q-pa-sm row justify-between">
        <slot name="target-header">
          <div class="text-bold">
            انتخاب شده
          </div>
          <div class=" text-grey-7">
            اقلام انتخابی را به دورن این بخش بکشید
          </div>
        </slot>
      </q-card-section>
      <q-separator/>

      <!--ITEMS-->
      <q-card-section class="col-12 q-pa-sm droppable" style="min-height: 100px" id="target"
                      @dragenter="onDragEnter"
                      @dragleave="onDragLeave"
                      @dragover="onDragOver"
                      @drop="onDrop('add',$event)"/>

      <!--FOOTER-->
      <slot name="target-footer" v-bind:items="options.filter(x=>selectedItems.includes(x[keyName]))"/>
    </q-card>
  </div>
</template>

<script>

export default {
  name: "SDragDrop",
  data: () => ({
    selectedItems: []
  }),
  props: {
    value: {
      type: Array | String | null,
      default: () => []
    },
    keyName: {
      type: String,
      default: "id"
    },
    options: {
      type: Array,
      default: []
    }
  },
  methods: {

    // store the id of the draggable element
    onDragStart(e) {
      e.dataTransfer.setData('text', e.target.id)
      e.dataTransfer.dropEffect = 'move'
    },

    onDragEnter(e) {
      // don't drop on other draggables
      if (e && e.target && e.target.draggable !== true) {
        e.target.classList.add('drag-enter')
      }
    },

    onDragLeave(e) {
      if (e && e.target && e.target.classList.contains('drag-enter'))
        e.target.classList.remove('drag-enter')
    },

    onDragOver(e) {
      e.preventDefault()
    },

    onDrop(n, e) {
      e.preventDefault()

      // don't drop on other draggables
      if (e.target.draggable === true) {
        return
      }

      if (!e.target.classList.contains('droppable')) return;

      const draggedId = e.dataTransfer.getData('text')
      this.exchange(draggedId, e.target)


      let value = null
      if (isNaN(parseInt(draggedId))) {
        value = draggedId
      } else {
        value = parseInt(draggedId)
      }

      if (n === 'add') {
        this.selectedItems.push(value)
      } else {
        let index = this.selectedItems.findIndex(x => x == value)
        this.selectedItems.splice(index, 1)
      }

      if (typeof this.value == 'string')
        this.$emit('input', this.selectedItems.join(','))
      else
        this.$emit('input', this.selectedItems)
    },
    exchange(draggedId, target) {
      const draggedEl = document.getElementById(draggedId)

      if (draggedEl) {
        // check if original parent node
        if (draggedEl && draggedEl.parentNode === target) {
          target.classList.remove('drag-enter')
        }

        // make the exchange
        draggedEl.parentNode.removeChild(draggedEl)
        target.appendChild(draggedEl)
        target.classList.remove('drag-enter')
      }
    }
  },
  mounted() {
    let items = []
    if (typeof this.value == 'string')
      items = this.value.split(',')
    else
      items = JSON.parse(JSON.stringify(this.value || []))
    this.selectedItems = items

    this.selectedItems.forEach(x => {
      let target = document.getElementById('target')
      this.exchange(x.toString(), target)
    })

  }
}
</script>

<style scoped lang="sass">

.drag-enter
  outline: 2px dashed #21BA45


.border-grey
  border: 2px solid #e1e1e1

.no-select
  -webkit-touch-callout: none
  -webkit-user-select: none
  -khtml-user-select: none
  -moz-user-select: none
  -ms-user-select: none
  user-select: none

</style>

