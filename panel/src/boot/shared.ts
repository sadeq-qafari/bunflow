import {boot} from 'quasar/wrappers'
import * as moment from 'jalali-moment'
import * as htmlToImage from 'html-to-image';
import {default as timezone} from 'moment-timezone'

declare global {
  interface String {
    toJalaliDateTime(): string;

    toJalaliDate(): string;

    toJalaliFullDate(): string;

    getTime(): string;

    getDate(): string;

    getTimeFromUtc(): string;

    toGregorianDateTime(): string;

    toGregorianDate(): string;

    toNumber(): string;

    toMoney(suffix: string): string;

    toEnglishNumber(): string;

    isNumberString(): boolean;

    camelize(): string;

    pascalize(): string;
  }

  interface Number {
    minuteToTime(): string;

    toNumber(): string;

    toMoney(suffix: string): string;
  }
}

function randomColor() {
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);
  console.log('color generated')
  return "rgb(" + r + "," + g + "," + b + ")";
}

async function screenshot() {
  try {
    return await htmlToImage.toBlob(document.body);
  } catch (e) {
    console.log('something went wrong with screenshot!', e);
    return null
  }
}

function openReport(reportName: string, query: { [key: string]: any; }) {
  let address = `${location.origin}/report/${reportName}`
  let queryParams = `?`
  for (let key in query) {
    queryParams += `&${key}=${query[key]}`
  }
  window.open(address + queryParams)
}

String.prototype.toNumber = function () {
  if (this != null) {
    return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  } else {
    return this
  }
}

Number.prototype.toNumber = function () {
  if (this != null) {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return this
  }
}

String.prototype.toMoney = function (suffix: string = '﷼') {
  return `${this.toNumber()} ${suffix}`.trimEnd()
}

Number.prototype.toMoney = function (suffix: string = '﷼') {
  return `${this.toNumber()} ${suffix}`.trimEnd()
}

Number.prototype.minuteToTime = function () {
  if (this == null) {
    return ""
  }
  let hour = Math.floor(Number(this) / 60)
  let minute = Number(this) % 60
  let hourString = hour < 10 ? '0' + hour.toString() : hour.toString()
  let minuteString = minute < 10 ? '0' + minute.toString() : minute.toString()
  return hourString + ':' + minuteString
};

String.prototype.toJalaliDateTime = function () {
  try {
    if (this != null && moment.from(String(this), 'en').isValid()) {
      return moment.from(String(this), 'en', 'YYYY-MM-DD HH:mm:ss').clone().format('jYYYY/jMM/jDD HH:mm:ss')
    } else {
      return String(this)
    }
  } catch (e) {
    return ''
  }
};

String.prototype.toJalaliDate = function () {
  try {
    if (this != null && moment.from(String(this), 'en').isValid()) {
      return moment.from(String(this), 'en', 'YYYY-MM-DD HH:mm:ss').clone().format('jYYYY/jMM/jDD')
    } else {
      return String(this)
    }
  } catch (e) {
    return ''
  }
};

String.prototype.toJalaliFullDate = function () {
  if (this != null && moment.from(String(this), 'en').isValid()) {
    let res = moment.from(String(this), 'en', 'YYYY-MM-DD HH:mm:ss').clone().format('dddd jDD jMMMM jYYYY')
    res = res.replace('Saturday', 'شنبه')
    res = res.replace('Sunday', 'یکشنبه')
    res = res.replace('Monday', 'دوشنبه')
    res = res.replace('Tuesday', 'سه‌شنبه')
    res = res.replace('Wednesday', 'چهارشنبه')
    res = res.replace('Thursday', 'پنجشنبه')
    res = res.replace('Friday', 'جمعه')
    res = res.replace('Farvardin', 'فروردین')
    res = res.replace('Ordibehesht', 'اردیبهشت')
    res = res.replace('Khordaad', 'خرداد')
    res = res.replace('Tir', 'تیر')
    res = res.replace('Mordaad', 'مرداد')
    res = res.replace('Shahrivar', 'شهریور')
    res = res.replace('Mehr', 'مهر')
    res = res.replace('Aabaan', 'آبان')
    res = res.replace('Aazar', 'آذر')
    res = res.replace('Dey', 'دی')
    res = res.replace('Bahman', 'بهمن')
    res = res.replace('Esfand', 'اسفند')
    return res
  } else {
    return String(this)
  }
};

String.prototype.getTime = function () {
  if (this != null && moment.from(String(this), 'en').isValid()) {
    return moment.from(String(this), 'en', 'YYYY-MM-DD HH:mm:ss').clone().format('HH:mm')
  } else {
    return String(this)
  }
};

String.prototype.getDate = function () {
  if (this != null && moment.from(String(this), 'en').isValid()) {
    return moment.from(String(this), 'en', 'YYYY-MM-DD HH:mm:ss').clone().format('YYYY-MM-DD')
  } else {
    return String(this)
  }
};

String.prototype.getTimeFromUtc = function () {
  if (this != null && moment.from(String(this), 'en').isValid()) {
    return timezone.utc(String(this)).tz('Asia/Tehran').format('HH:mm')
  } else {
    return String(this)
  }
};

String.prototype.toGregorianDateTime = function () {
  if (this != null && moment.from(String(this), 'fa').isValid()) {
    return moment.from(String(this), 'fa', 'jYYYY-jMM-jDD HH:mm:ss').clone().format('YYYY-MM-DD HH:mm:ss')
  } else return String(this)
};

String.prototype.toGregorianDate = function () {
  if (this != null && moment.from(String(this), 'fa').isValid()) {
    return moment.from(String(this), 'fa', 'jYYYY-jMM-jDD HH:mm:ss').clone().format('YYYY-MM-DD')
  } else return String(this)
};

String.prototype.toEnglishNumber = function () {
  if (this == null)
    return '';
  const englishNumbers = "0123456789";
  const persianNumbers1 = "٠١٢٣۴۵۶٧٨٩";
  const persianNumbers2 = "۰۱۲۳۴۵۶۷۸۹";
  const arabicNumbers = "٠١٢٣٤٥٦٧٨٩";
  let res = ''
  for (let c of this) {
    let index1 = persianNumbers1.indexOf(c)
    let index2 = persianNumbers2.indexOf(c)
    let index3 = arabicNumbers.indexOf(c)
    let index = (index1 >= 0 ? index1 : index2 >= 0 ? index2 : index3)
    res += (index >= 0 ? englishNumbers[index] : c);
  }

  return res.toString()
}

String.prototype.isNumberString = function () {
  return RegExp(/^[0-9]*$/).test(String(this))
};

String.prototype.camelize = function () {
  return (this as string).replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

String.prototype.pascalize = function () {
  return `${(this as string)}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\w/), s => s.toUpperCase());
}


const commentElement = document.createComment(' ');
Object.defineProperty(commentElement, 'setAttribute', {
  value: () => undefined,
});

function convertHtmlElementToComment(el: any, vnode: any) {
  vnode.elm = commentElement;
  vnode.text = ' ';
  vnode.isComment = true;
  vnode.context = undefined;
  vnode.tag = undefined;
  vnode.data.directives = undefined;

  if (vnode.componentInstance) {
    (vnode.componentInstance as any).$el = commentElement;
  }

  if (el.parentNode) {
    el.parentNode.replaceChild(commentElement, el);
  }
}

export default boot(({Vue, store, router}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!process.env.FLOW_STANDALONE) store.dispatch('load')
  Vue.prototype.$randomColor = randomColor
  Vue.prototype.$navigateBack = async function () {
    let previousRoute = sessionStorage.getItem('previousRoute')
    if (previousRoute)
      await router.push({path: previousRoute})
    else router.back()
  }
  Vue.prototype.$openReport = openReport
  Vue.prototype.$screenshot = screenshot

  Vue.directive('permission', (el, binding, vnode: any) => {
    if (store.getters.hasPermission(binding.value)) return

    convertHtmlElementToComment(el, vnode)
  });
})

