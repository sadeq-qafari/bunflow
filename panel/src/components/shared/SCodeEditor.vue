<template>
  <div class="editor-input">
    <div class="q-pa-sm text-center">{{label}}</div>
    <q-separator color="grey-7" inset=""/>
    <div :id="id" class="editor  language-javascript" style="direction: ltr !important;"></div>
  </div>
</template>

<script>
import {CodeJar} from 'codejar'
import {default as Prism} from 'prismjs'

export default {
  name: "SCodeEditor",
  data:()=>({
    id:Math.random().toString()
  }),
  props: {
    value: String | null,
    label: String
  },
  methods: {
    getValue(value) {
      return value
    },
    onInput($event) {
      this.$emit('input', $event)
    },
  },
  async mounted() {
    console.log(Prism)
    document.getElementById(this.id).textContent = this.value

    let options = {
      tab: ' '.repeat(4)
    }

    const highlightFn = (editor) => {
      const code = editor.textContent
      editor.innerHTML = Prism.highlight(code, Prism.languages.javascript, 'javascript')
    }

    let jar = CodeJar(document.getElementById(this.id), highlightFn, options)

    jar.onUpdate(code => {
      this.$emit('input', code)
    })

  }
}
</script>

<style lang="scss">
@import url("../../../node_modules/prismjs/themes/prism-tomorrow.css");
.editor {
background-color: inherit;
  border-radius: inherit;
  color: #ccc;
  font-family: 'Source Code Pro', monospace;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 20px;
  padding: 10px;
  tab-size: 4;

}
.editor-input{
  border-radius: 5px;
  background-color: #000333;
  color: #e1e1e1;
}
</style>

