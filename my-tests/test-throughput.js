/*

This is a k6 test script that imports the xk6-mqtt and
tests Mqtt with a 100 messages per connection.

*/

import {
    check,
    sleep
} from 'k6';

const mqtt = require('k6/x/mqtt');

const TARGET_VUS = __ENV.TARGET_VUS || 1000;
const BROKER_HOST = __ENV.BROKER_HOST || 'localhost';
const BROKER_PORT = __ENV.BROKER_PORT || 1883;

export const options = {
  maxDuration: '90s', // Hard time limit
  scenarios: {
    contacts: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: TARGET_VUS },
        { duration: '30s', target: TARGET_VUS },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
};

// number of message pusblished and receives at each iteration
const messageCount = 1;

// Seconds to sleep the VU between iterations. This limits the message throughput
// VoCoVo clients currently average 1300msg/s or about one message every 11.5 seconds per controller
const iterationSleepTime = 10

const rnd_count = 2000;

// create random number to create a new topic at each run
let rnd = Math.random() * rnd_count;

// conection timeout (ms)
let connectTimeout = 2000

// publish timeout (ms)
let publishTimeout = 2000

// subscribe timeout (ms)
let subscribeTimeout = 2000

// connection close timeout (ms)
let closeTimeout = 2000

// Mqtt topic one per VU
const k6Topic = `test-k6-plugin-topic ${rnd} ${__VU}`;
// Connect IDs one connection per VU
const k6SubId = `k6-sub-${rnd}-${__VU}`;
const k6PubId = `k6-pub-${rnd}-${__VU}`;

// create publisher client
const publisher = new mqtt.Client(
    // The list of URL of  MQTT server to connect to
    [BROKER_HOST + ":" + BROKER_PORT],
    // A username to authenticate to the MQTT server
    "",
    // Password to match username
    "",
    // clean session setting
    false,
    // Client id for reader
    k6PubId,
    // timeout in ms
    connectTimeout,
)

const subscriber = new mqtt.Client(
  // The list of URL of  MQTT server to connect to
  [BROKER_HOST + ":" + BROKER_PORT],
  // A username to authenticate to the MQTT server
  "",
  // Password to match username
  "",
  // clean session setting
  false,
  // Client id for reader
  k6SubId,
  // timeout in ms
  connectTimeout,
)

let connectionAttempted = false;

function connectClients() {
    try {
        connectionAttempted = true;
        publisher.connect()
        subscriber.connect()
    } catch (error) {
        console.error("Connection error:", error);
    }
}

export default function () {
    // Attempt to connect to broker on first iteration only
    if (!connectionAttempted) {
        connectClients();
    }

    // Message content one per ITER
    const k6Message = `k6-message-content-${rnd} ${__VU}:${__ITER}`;
    check(publisher, {
        "is publisher connected": publisher => publisher.isConnectionOpen()
    });
    check(subscriber, {
        "is subcriber connected": subscriber => subscriber.isConnectionOpen()
    });

    // subscribe first
    try {
        subscriber.subscribe(
            // topic to be used
            k6Topic,
            // The QoS of messages
            1,
            // timeout in ms
            subscribeTimeout,
        )
    } catch (error) {
      console.error("subscribe error:", error)
      // you may want to use fail here if you want only to test successfull connection only
      // fail("fatal could not connect to broker for subscribe")
    }

    let count = messageCount;
    subscriber.addEventListener("message", (obj) => {
        // closing as we received one message
        let message = obj.message
        check(message, {
            "message received": msg => msg != undefined
        });
        check(message, {
            "is content correct": msg => msg == k6Message
        });

        if (--count > 0) {
            // tell the subscriber that you want to wait for more than one message
            // if you don't call subContinue you'll receive only one message per subscribe
            subscriber.subContinue();
        }
    })
    subscriber.addEventListener("error", (err) => {
        check(null, {
            "message received": false
        });
    })
    for (let i = 0; i < messageCount; i++) {
        // publish count messages
        let err_publish;
        try {
            publisher.publish(
                // topic to be used
                k6Topic,
                // The QoS of messages
                1,
                // Message to be sent
                k6Message,
                // retain policy on message
                false,
                // timeout in ms
                publishTimeout,
                // async publish handlers if needed
                // (obj) => { // success
                //     console.log(obj.type) // publish
                //     console.log(obj.topic) // published topic
                // },
                // (err) => { // failure
                //     console.log(err.type)  // error
                //     console.log(err.message)
                // }
            );
        } catch (error) {
            err_publish = error
        }
        check(err_publish, {
            "is sent": err => err == undefined
        });
    }
    sleep(iterationSleepTime);
}

export function teardown() {
    console.log("teardown");
    // closing both connections at VU close
    publisher.close(closeTimeout);
    subscriber.close(closeTimeout);
}
