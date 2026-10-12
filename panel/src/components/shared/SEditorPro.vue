<template>
  <div :class="['bg-grey-2 column no-wrap SEditorPro',fullscreen?'fullscreen':'rounded-borders mini-editor']">
    <q-toolbar class="col-auto ">
      <div class="text-subtitle1">
        {{ label }}
      </div>
      <q-space/>
      <small class="col-auto q-mx-xs">مدت مطالعه: </small>
      <small class="col-auto q-mr-xs" id="reading-time-count"></small>
      <small class="col-auto q-mr-md">دقیقه</small>
      <small class="col-auto q-mx-xs">تعداد کلمات: </small>
      <small class="col-auto q-mr-md" id="word-count"></small>
      <small class="col-auto q-mx-xs">تعداد حرف: </small>
      <small class="col-auto q-mr-md" id="char-count"></small>
      <q-btn dense flat color="white" text-color="primary" :icon="fullscreen? 'fullscreen_exit':'fullscreen'"
             @click="toggleFullscreen"/>
    </q-toolbar>
    <ckeditor :editor="editor" :value="value" @input="$emit('input',$event )" :config="editorConfig" @ready="onReady"/>
  </div>
</template>

<script>
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import DataFilter from '@ckeditor/ckeditor5-html-support/src/datafilter';
import DataSchema from '@ckeditor/ckeditor5-html-support/src/dataschema';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import List from '@ckeditor/ckeditor5-list/src/list';
import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import MediaEmbedToolbar from '@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import SpecialCharactersLatin from '@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin';
import SpecialCharactersMathematical from '@ckeditor/ckeditor5-special-characters/src/specialcharactersmathematical';
import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
import fa from '@ckeditor/ckeditor5-build-classic/build/translations/fa';
// import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';

export default {
  name: "SEditorPro",
  props: {
    value: String | null,
    label: String | null,
  },
  data: () => ({
    fullscreen: false,
    countOfWords: 0,
    countOfCharacters: 0,
    editor: ClassicEditor,
    editorConfig: {
      plugins: [
        EssentialsPlugin,
        Alignment,
        Autoformat,
        AutoImage,
        AutoLink,
        BlockQuote,
        Bold,
        Code,
        CodeBlock,
        DataFilter,
        DataSchema,
        FindAndReplace,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        GeneralHtmlSupport,
        Heading,
        Highlight,
        HorizontalLine,
        Image,
        ImageCaption,
        ImageResize,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        ListStyle,
        // Markdown,
        MediaEmbed,
        MediaEmbedToolbar,
        PageBreak,
        Paragraph,
        PasteFromOffice,
        RemoveFormat,
        SourceEditing,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Table,
        TableCaption,
        TableCellProperties,
        TableProperties,
        TableToolbar,
        TextTransformation,
        Underline,
        WordCount
      ],
      toolbar: {
        items: [
          'heading',
          '|',
          'bold',
          'underline',
          'strikethrough',
          'italic',
          'removeFormat',
          'link',
          'bulletedList',
          'numberedList',
          'horizontalLine',
          '|',
          'fontBackgroundColor',
          'fontColor',
          'fontSize',
          'fontFamily',
          'alignment',
          'outdent',
          'indent',
          '|',
          'imageUpload',
          'blockQuote',
          'insertTable',
          'mediaEmbed',
          'specialCharacters',
          'code',
          'sourceEditing',
          'codeBlock',
          'highlight',
          'findAndReplace'
        ]
      },
      wordCount: {
        onUpdate: stats => {
          // Prints the current content statistics.
          document.getElementById('word-count').innerHTML = stats.words.toNumber();
          document.getElementById('char-count').innerHTML = stats.characters.toNumber();
          document.getElementById('reading-time-count').innerHTML = (stats.words / 250).toFixed();
        }
      },
      link: {
        decorators: {
          buttonLink: {
            mode: 'manual',
            label: 'CTA',
            defaultValue: false,
            attributes: {
              class: 'link-button'
            }
          }
        }
      },
      fontFamily: {
        options: [
          'default',
        ]
      },
      image: {
        toolbar: ['toggleImageCaption', 'linkImage', 'imageStyle:block', 'imageStyle:side', 'imageStyle:inline', 'imageResize']
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells',
          'tableProperties', 'tableCellProperties']
      },
      mediaEmbed: {
        previewsInData: true,
        extraProviders: [
          {
            name: 'aparat',
            url: /^aparat\.com\/v\/(\w+)/,
            html: match => '<div class="h_iframe-aparat_embed_frame"><span style="display: block;padding-top: 57%"></span><iframe src="https://www.aparat.com/video/video/embed/videohash/' + match[1] + '/vt/frame" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe></div>',

          },
        ]
      },
      language: 'fa',
    }
  }),
  computed: {},
  methods: {
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen
    },
    onReady(editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new SaanaaUploadAdapter(loader, this.$axios);
      };

    }
  },
}

class SaanaaUploadAdapter {
  constructor(loader, axios) {
    // The file loader instance to use during the upload.
    this.loader = loader;
    this.axios = axios
  }

  // Starts the upload process.
  async upload() {
    return this.loader.file
      .then(async file => new Promise(async (resolve, reject) => {
        const data = new FormData()
        data.append('file', file)
        const res = await this.axios.post(`${process.env.API_URL}/cdn/upload/image`, data, {
          onUploadProgress: data => {
            this.loader.uploadTotal = data.total;
            this.loader.uploaded = data.uploaded;
          },
          noNotify: true
        }).catch(() => {

        })

        if (res.data && res.data.length > 0) {
          resolve(
            {
              default: `${process.env.API_URL}/cdn/download/${res.data[0].urls[0]}`
            }
          )
        } else {
          reject()
        }
      }));

  }

  // Aborts the upload process.
  abort() {
    // Reject the promise returned from the upload() method.
    console.log('aborted')
  }
}

</script>

<style lang="scss">


.ck {
  font-family: iransans !important;
}

.ck-button {
  justify-content: center !important;
}

.ck-focused {
  border-top-color: #40c4ff !important;
  box-shadow: none !important;
  border-bottom: 1px solid #40c4ff !important;
  border-right: 1px solid #40c4ff !important;
  border-left: 1px solid #40c4ff !important;
}

.fullscreen {
  .ck-content {
    height: calc(100vh - 100px) !important;
    overflow: auto !important;
  }
}

.mini-editor {
  max-height: 400px !important;

  .ck-content {
    height: 200px !important;
    overflow: scroll !important;
  }

}

.link-button {
  text-decoration: none;

  span {
    padding: 7px;
    border-radius: 3px;
  }
}

.SEditorPro.fullscreen {
  height: calc(100vh - 25px) !important;
}

.ck-balloon-panel {
  z-index: 9999 !important;
}
</style>

