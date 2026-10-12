<template>
  <div v-if="col">
<!--    <q-menu v-if="hasMenu"-->
<!--            touch-position-->
<!--            context-menu-->
<!--    >-->

<!--      <q-list dense style="min-width: 100px">-->
<!--        <q-item clickable v-close-popup :to="`/service/${relatedService.name}/${relatedModel.name}?filter=`">-->
<!--          <q-item-section>-->
<!--            {{ relatedModel.title }}-->
<!--          </q-item-section>-->
<!--        </q-item>-->
<!--      </q-list>-->

<!--    </q-menu>-->
    <q-checkbox disable dense v-if="col.type === 'bool'" :value="val"/>
    <div v-else-if="col.type === 'date'">
      <div v-if="!!val">{{ moment.from(val, 'en').format('jYYYY/jMM/jDD📅') }}</div>
    </div>
    <div v-else-if="col.type === 'datetime' || col.type === 'instant'">
      <div v-if="!!val">{{
          !!val && moment.from(val, 'en').format('HH:mm:ss⏰ jYYYY/jMM/jDD📅')
        }}
      </div>
    </div>
    <div v-else-if="col.type === 'time'">
      <div v-if="!!val">{{
          `${val}⏰`
        }}
      </div>
    </div>
    <div v-else-if="col.type === 'image'">
      <q-item dense v-if="!!val" class="q-pa-none">
        <q-item-section side>
          <q-avatar rounded size="32px">
            <q-img contain :ratio="1" :src="`${cdnDownloadUrl}/${val.fileName}`"/>
            <q-popup-proxy :breakpoint="20000">
              <q-img contain width="100vw" class="bg-white" :src="`${cdnDownloadUrl}/${val.fileName}`"/>
            </q-popup-proxy>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ val.alt }}</q-item-label>
          <q-item-label caption>{{ val.description }}</q-item-label>
        </q-item-section>
      </q-item>
    </div>
    <div v-else-if="col.type === 'geoLocation'">
      <q-item dense v-if="!!val" class="q-pa-none">
        <q-item-section side>
          <q-avatar rounded size="32px">
            <q-icon name="public" size="md" color="primary"/>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label caption class="text-grey-8">{{ val.latitude }}</q-item-label>
          <q-item-label caption class="text-grey-8">{{ val.longitude }}</q-item-label>
        </q-item-section>
      </q-item>
    </div>
    <div v-else-if="col.element && col.element.type === 'geoPolygon'">
      <q-item dense v-if="!!val" class="q-pa-none">
        <q-item-section side>
          <q-avatar rounded size="32px">
            <q-icon name="public" size="md" color="primary"/>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          {{ val ? 'موقعیت مکانی' : '' }}
        </q-item-section>
      </q-item>
    </div>
    <div v-else-if="col.element && col.element.type === 'money'">
      <div v-if="!!val">{{
          !!val && val.toNumber()
        }}
      </div>
    </div>
    <div v-else-if="col.element && (col.element.type === 'textEditor' || col.element.type === 'textEditorPro')">
      <q-chip color="light-blue-3" clickable square label="نمایش" class=" text-white" style="font-size: 10px">
        <!--      <q-tooltip v-if="val && val.length>30">-->
        <!--        <div :style="{'direction':col.isLtr?'ltr':'rtl','display':'flex','zoom':'0.5'}">-->
        <!--          <div v-html="val"></div>-->
        <!--        </div>-->
        <!--      </q-tooltip>-->
        <q-popup-proxy class="border-radius">
          <div class="q-py-md bg-white border-radius"
               :style="{'direction':col.isLtr?'ltr':'rtl','display':'flex','zoom':'0.7','max-height': minimal? '90vh':'50vh !important','width': minimal?'90vw': '70vw !important'}"
          >
            <div v-html="val"></div>
          </div>
        </q-popup-proxy>
      </q-chip>
    </div>
    <div v-else>
      {{ val }}
      <q-tooltip v-if="val && val.length>30">
        <div :style="{'direction':col.isLtr?'ltr':'rtl','display':'flex'}">
          <div v-html="val"></div>
        </div>
      </q-tooltip>
    </div>
  </div>
</template>

<script>
import * as moment from 'jalali-moment'
import {ref} from "@vue/composition-api";

export default {
  name: "SDataGridCell",
  data: () => ({
    moment,
    cdnDownloadUrl: `${process.env.API_URL}/cdn/download`
  }),
  computed: {
    val() {
      return this.value || this.prop.value
    },
    // hasMenu() {
    //   return this.relatedModel != null
    // },
    // model() {
    //   return this.$store.state.services.find(x => x.models.some(y => y.id === this.col.modelId)).models?.find(x => x.id == this.col.modelId)
    // },
    // relatedModelProperty() {
    //   let mainFieldIndex = this.model?.properties.findIndex(x => x.labelFieldName === this.col.name)
    //   if (mainFieldIndex >= 0) {
    //     return this.model?.properties[mainFieldIndex]
    //   }
    // },
    // relatedModel() {
    //   if (this.relatedModelProperty && this.relatedModelProperty.relatedModelId > 0) {
    //     return this.$store.state.services.find(x => x.models.some(y => y.id === this.relatedModelProperty.relatedModelId))?.models.find(x => x.id == this.relatedModelProperty.relatedModelId)
    //   }
    // },
    // relatedService() {
    //   return this.$store.state.services.find(x => x.id == this.relatedModel.serviceId)
    // }
  },
  props: {
    col: Object | null,
    prop: Object | null,
    minimal: {
      type: Boolean,
      default: false
    },
    value: String | Number | Object | null | undefined,
  },
  mounted() {

  }
}
</script>

<style scoped>

</style>

