import { sleep, check, fail } from 'k6';
const mqtt = require('k6/x/mqtt')



const BROKER_URL = 'mqtt://emqx-listeners.default.svc.cluster.local:1883';

const virtualUserId = __VU
// Create a random 6 digit string
const randomString = Math.random().toString(36).substring(2, 8);
// console.log(`Creating client with id: ${virtualUserId}...`);
const clientId = `k6-mqtt-client-${virtualUserId}-${randomString}`;
const user = '';
const password = '';
const connectTimeout = 2000;
const client = new mqtt.Client([BROKER_URL], user, password, false, clientId, connectTimeout);

let connectionAttempted = false;

function connectClient() {
  try {
    client.connect();
  } catch (error) {
    console.error("Connection error:", error);
  }
}

export default function() {
  if (!connectionAttempted) {
    connectClient();
    connectionAttempted = true;
  }

  check(client, {
    "client connection open": client => client.isConnectionOpen()
  });

  sleep(5);
}
