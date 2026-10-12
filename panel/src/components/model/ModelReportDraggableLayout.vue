<template>
  <div>
    <div class="full-width">
      <div class="row q-py-md q-gutter-md">
        <div @drag="drag" @dragend="dragend(col)"
             class="droppable-element col-auto border-radius q-px-md q-py-sm cursor-pointer" style="user-select: none"
             :draggable="layout.map(x => parseInt(x.w)).reduce((a, b) => a + b, 0) < 8"
             v-for="col of columns"
             unselectable="on">
          {{ col.label }}
        </div>
      </div>
    </div>

    <div class="col-12 row q-mb-md">
      <div
        class="column full-width border-radius border-right-medium bg-light-blue-1 q-pa-md text-subtitle2 text-weight-regular text-light-blue">
        <div class="q-mb-md">برای ایجاد گزارش، فیلدهای مورد نظر خود را در این قسمت رها کنید</div>
        <div>* برای تغییر اندازه، علامت فلش پایین هر مورد را بکشید</div>
      </div>
    </div>

    <div id="content" class="border-radius overflow-hidden" style="min-height: 100px">
      <grid-layout ref="gridlayout" :layout="layout" @layout-updated="$emit('input',$event)" style="min-height: 100px"
                   :col-num="8"
                   :row-height="100"
                   :max-rows="1"
                   is-draggable
                   :is-resizable="true"
                   vertical-compact
                   use-css-transforms
                   is-mirrored
                   prevent-collision
      >
        <grid-item :key="item.i" v-for="(item, index) in layout"
                   class="border-radius bg-grey-2"
                   :x="item.x"
                   :y="item.y"
                   :w="item.w"
                   :h="item.h"
                   :i="item.i"
        >
          <div class="column full-height border-radius overflow-hidden">

            <!-- label -->
            <div class="column full-width col q-pa-md justify-center items-center">
              <div class="text-subtitle2 text-weight-light text-center">
                {{ item.label }}
              </div>
            </div>

            <!-- delete -->
            <div class="full-width col-auto">
              <q-btn class="full-width full-height" size="sm" color="red-2" text-color="red-7" label="حذف" unelevated
                     dense @click="deleteItem(item, index)"/>
            </div>

          </div>
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script>
import {GridLayout, GridItem} from "vue-grid-layout"

let mouseXY = {"x": null, "y": null};
let DragPos = {"x": null, "y": null, "w": 1, "h": 1, "i": null};
export default {
  name: 'ModelReportDraggableLayout',
  components: {
    GridLayout,
    GridItem
  },
  data: () => ({
    layout: [],
    columns: []
  }),
  props: {
    cols: {type: Array, default: []},
    value: {type: Array, default: []},
  },
  computed: {},
  mounted() {
    this.layout = [...(this.value || [])]
    this.columns = [...this.cols].filter(x => !this.layout.map(l => l.value).includes(x.value))

    document.addEventListener("dragover", function (e) {
      mouseXY.x = e.clientX;
      mouseXY.y = e.clientY;
    }, false);
  },
  beforeDestroy() {
  },
  methods: {
    drag: function (e) {
      let parentRect = document.getElementById('content').getBoundingClientRect();
      let mouseInGrid = false;
      if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
        mouseInGrid = true;
      }
      if (mouseInGrid && (this.layout.findIndex(item => item.i === 'drop')) === -1) {
        this.layout.push({
          x: (this.layout.length * 2) % (this.colNum || 12),
          y: this.layout.length + (this.colNum || 12), // puts it at the bottom
          w: 1,
          h: 1,
          i: 'drop',
        });
      }
      let index = this.layout.findIndex(item => item.i === 'drop');
      if (index !== -1) {
        try {
          this.$refs.gridlayout.$children[this.layout.length].$refs.item.style.display = "none";
        } catch (e) {
        }
        let el = this.$refs.gridlayout.$children[index];
        el.dragging = {"top": mouseXY.y - parentRect.top, "left": mouseXY.x - parentRect.left};
        let new_pos = el.calcXY(mouseXY.y - parentRect.top, mouseXY.x - parentRect.left);
        if (mouseInGrid === true) {
          this.$refs.gridlayout.dragEvent('dragstart', 'drop', new_pos.x, new_pos.y, 1, 1);
          DragPos.i = String(index);
          DragPos.x = this.layout[index].x;
          DragPos.y = this.layout[index].y;
        }
        if (mouseInGrid === false) {
          this.$refs.gridlayout.dragEvent('dragend', 'drop', new_pos.x, new_pos.y, 1, 1);
          this.layout = this.layout.filter(obj => obj.i !== 'drop');
        }
      }
    },
    dragend: function (e) {

      let parentRect = document.getElementById('content').getBoundingClientRect();
      let mouseInGrid = false;
      if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
        mouseInGrid = true;
      }
      if (mouseInGrid === true) {
        let i = this.columns.findIndex(x => x.value === e.value)
        this.columns.splice(i, 1)
        this.$refs.gridlayout.dragEvent('dragend', 'drop', DragPos.x, DragPos.y, 1, 1);
        this.layout = this.layout.filter(obj => obj.i !== 'drop');
        // UNCOMMENT below if you want to add a grid-item
        this.layout.push({
          x: DragPos.x,
          y: DragPos.y,
          w: 1,
          h: 1,
          i: DragPos.i,
          ...e
        });
        // this.$refs.gridLayout.dragEvent('dragend', DragPos.i, DragPos.x, DragPos.y, 1, 1);
        // try {
        //   this.$refs.gridLayout.$children[this.layout.length].$refs.item.style.display = "block";
        // } catch {
        // }
      }
    },
    deleteItem(item, index) {
      this.layout.splice(index, 1)
      this.columns = [...this.cols].filter(x => !this.layout.map(l => l.value).includes(x.value))
    }
  }
}
</script>

<style lang="scss" scoped>
.border-right-medium {
  border-left: 5px solid $light-blue;
}

.droppable-element {
  text-align: center;
  background: $light-blue;
  color: white;
}

.vue-grid-layout {
  background: $grey-4;
}

.vue-grid-item:not(.vue-grid-placeholder) {
  background: #ccc;
}

.vue-grid-item .resizing {
  opacity: 0.9;
}

.vue-grid-item .static {
  background: #cce;
}

.vue-grid-item .text {
  font-size: 24px;
  text-align: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 100%;
  width: 100%;
}

.vue-grid-item .no-drag {
  height: 100%;
  width: 100%;
}

.vue-grid-item .minMax {
  font-size: 12px;
}

.vue-grid-item .add {
  cursor: pointer;
}

</style>

