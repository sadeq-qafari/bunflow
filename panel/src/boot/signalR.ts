import {boot} from 'quasar/wrappers'
import * as signalR from '@microsoft/signalr'
import {Notify} from 'quasar'

declare module 'vue/types/vue' {
  interface Vue {
    $ws: signalR.HubConnection;
  }
}

const connection = new signalR.HubConnectionBuilder()
  .withUrl(process.env.API_URL + "/core/ws/notification")
  .configureLogging(signalR.LogLevel.Information)
  .build();

async function start() {
  try {
    // await connection.start().then(data => connection.invoke('login', localStorage.getItem('accessToken'), 'employee'));
    //console.log("SignalR Connected.");
  } catch (err) {
    console.log(err);
    setTimeout(start, 5000);
  }
}


connection.onclose(start);

connection.on("test", args => {
  Notify.create({
    type: 'secondary',
    message: 'نوتیف اومد...'
  })
  console.log('test is called', args)
})

export default boot(async ({Vue, app, store, router}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  Vue.prototype.$ws = connection

  await start();
})

