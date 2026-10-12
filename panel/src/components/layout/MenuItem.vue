<template>
  <div class="column">
    <q-expansion-item
      v-if="data && data.children && data.children.length > 0"
      :group="parentId.toString()"
      dense
      :header-style="headerStyle"
      expand-separator
      :icon="data.icon"
      header-class="text-bold"
      :label="data.title"
      ref="expItem"
    >
      <template v-slot:header>
        <div class="full-width">
          <div class="row q-gutter-x-xs">

            <!-- separator -->
            <div v-if="data.parentId>0" class="row col-auto" style="width: 10px">

              <!-- vertical -->
              <div class="col-auto full-height">
                <q-separator :class="{'half-height': isLastItem}" vertical/>
              </div>

              <!-- horizontal -->
              <div class="row col full-height items-center">
                <q-separator/>
              </div>

            </div>
            <div v-else style="width:1px"></div>
            <!-- icon, title -->
            <div class="col q-py-sm">
              <div class="row q-gutter-x-md items-center">

                <!-- icon -->
                <q-icon size="1.5rem" :name="data.icon"/>

                <!-- title -->
                <div class="text-subtitle2 text-grey-9">
                  {{ data.title }}
                </div>

              </div>
            </div>

          </div>
        </div>
      </template>
      <menu-item
        v-if="isVisible(item)"
        @expand="expand"
        :active="checkActive(item)"
        :inset="inset + 0.4"
        :color="data && data.colorHex || color"
        :parent-id="data.id"
        v-for="(item, i) of data.children"
        :isLastItem="data.children.length - 1 === i"
        :key="i"
        :data="item"
        ref="menuItem"
      />
    </q-expansion-item>
    <router-link
      v-else
      :class="['full-width item cursor-pointer', active ? 'text-white' : undefined]"
      :style="itemStyle" tag="a" :to="`/service/${data.link}`">
      <div class="row q-gutter-x-xs">

        <!-- separator -->
        <div class="row col-auto" style="width: 10px">

          <!-- vertical -->
          <div class="col-auto full-height">
            <q-separator :class="{'half-height': isLastItem}" vertical/>
          </div>

          <!-- horizontal -->
          <div class="row col full-height items-center">
            <q-separator/>
          </div>

        </div>

        <!-- icon, title -->
        <div class="col q-py-sm">
          <div class="row q-gutter-x-md items-center">

            <!-- icon -->
            <q-icon class="col-auto" size="1.5rem" :name="data.icon"/>

            <!-- title -->
            <div :class="['col text-subtitle2 single-line-clamp', active ? 'text-white' : 'text-grey-9']">
              {{ data.title }}
            </div>


            <!-- icon -->
            <!--            <q-icon size="1.5rem" name="arrow_left" class="q-pr-lg col-auto"/>-->

          </div>
        </div>

      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from '@vue/composition-api'
import {IMenu} from "boot/api";

export default defineComponent({
  name: "MenuItem",
  data: () => ({
    refId: Math.random(),
  }),
  props: {
    data: Object as PropType<IMenu>,
    active: {
      type: Boolean,
      default: false
    },
    inset: {
      type: Number,
      default: 0,
    },
    color: String,
    parentId: {
      type: [String, Number, null] as PropType<any>,
      default: Math.random(),
    },
    isLastItem: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    '$route.path'() {
      if (this.active) {
        this.$emit('expand')
      }
    }
  },
  computed: {
    headerStyle(): any {
      return {
        borderBottom: `1px dashed #fefefe`,
        paddingRight: `${this.inset > 0 ? (this.inset * 65) : 10}px !important`,
        backgroundColor: `#40c4ff${this.insetOpacity}`,
        color: `#${this.data && this.data.colorHex || this.color}`,
      }
    },
    itemStyle(): any {
      return {
        paddingRight: `${this.inset * 65}px !important`,
        borderBottom: `1px solid #fefefe`,

        backgroundColor: `#40c4ff${this.active ? '' : this.insetOpacity}`,
        color: `#${this.color || this.data && this.data.colorHex}`,
        textDecoration: 'none'
      }
    },
    insetOpacity(): any {
      if (this.inset > 0) return ((this.inset / 0.4) * 10 + 10).toFixed(0)
      else return '00'

    },
  },
  methods: {
    isVisible(menu: any) {
      let hasChildren = menu?.children?.length > 0
      let hasLink = (menu?.link != null && menu?.link?.trim().length > 0)
      return hasChildren || hasLink
    },
    expand() {
      if (this.$refs.expItem != null) {
        (this.$refs.expItem as any)?.show()
      }
      if (this.$refs.menuItem != null && (this.$refs.menuItem as any).expand) (this.$refs.menuItem as any)?.expand()
      this.$emit('expand')
    },
    checkActive(item: any) {
      if (item.link && item.link.length > 0) {
        let currentPath = this.$route.path.split('/').slice(2, 20).join('/')
        return currentPath.toLowerCase() === item.link.toLowerCase()
      } else return false
    }
  },
  mounted() {
    if (this.active) {
      this.$emit('expand')
    }
  }
})
</script>
<style>
.half-height {
  height: 51%
}

.item {
  transition: 0.1s;
}

.item:hover {
  transition: 0.1s;
  backdrop-filter: brightness(0.95);
}
</style>

