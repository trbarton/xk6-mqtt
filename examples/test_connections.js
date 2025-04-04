import { sleep, check, fail } from 'k6';
const mqtt = require('k6/x/mqtt')

export const options = {
  scenarios: {
    contacts: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '60s', target: 5000 },
        { duration: '60s', target: 5000 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
};

const BROKER_URL = 'mqtt://192.168.66.101:30773';

const virtualUserId = __VU
// console.log(`Creating client with id: ${virtualUserId}...`);
const clientId = `k6-mqtt-client-${virtualUserId}`;
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
