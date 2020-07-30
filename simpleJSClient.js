const fs = require("fs");
const jwt = require("jsonwebtoken");
const mqtt = require("mqtt");
// [END iot_mqtt_include]
const prv_key = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCp12e3sMbr0Q9F
9BCT9EX/7RtV8uPVPGIZhJjZr9sB3hUz9/Uf3TSohHLyCP/Fqli3+IyW5z/R+S8V
1iGfLZppOGVqT6pKr4nbwTrp5iLFEf0qLEHk3KQTqd4x8Q+l91pjmggrAhE1O24j
VnAlc9HzTDXp5lFoZz8XXQpk0+3KcxoK0gOFT91xAVhHWsPOIiwxkxKEOwt12+b3
c+7IHhUa9Xk+YGZajpxurdZZjJDDeG39HXz4eY0FtkljGM87ol7/gpQ2aJRcT6NF
3vsHpwY22PO8Tr2BDwGJdHhnJO2Oi4Y/59ITygA1n2oJVlp1FMjUS6DD+Y7GR2If
7H2xqq6VAgMBAAECggEARFYQPD+begyO6aWO+gjiFVxQkF9/Pi/ihMPuQEBajUDP
JS7SaPS3GEraePoX929X7QXLg3geHJz3TgDvXD2cEFQJsiHFsfE5NbtkufHH8aUQ
SOSvyqbgOa0yYsPMeQmyS7sRKETXqaR05zEDRH56bjsuwiLShIBuSTc9VF5VIgxP
9Rn92tDsdRYw+6l8AljEVqQFO90lZ7a2mFzvNizQoSRH4OMObeWhDhR8cP7BqHon
Tup8CTxwBVARQL2JFR5nyf52wgyZW0QCbzUQlcSDuQaCnD2LG5LaoObfZEYm5u51
NPmoOTKYod2spCFf3Zyrz3nHC1WQXm9hqM/TVJg3jQKBgQDYtOKRcBpMJJh5XpPW
WAvUkoUthblD6eTaQAsfKNO1a/htfY1mkRGVr0icDJxFsNS4XXhFibEtN5cpjwHB
rLI+JUWCvrhXTOkwgEfmTQBUh1RVD2JJJgHMGZ5hy+yhOms8sR/WMT9amS+tjlUw
5wflixV1d1IWPSNb0TwTEAx2pwKBgQDIoyCIFXk4+LyTXDR9Xr2mUDqBdJOSguL1
xlrsJ3DAupTEo0XHNQcFhvcSTp3ECW2WXyeZtB2DnyvJy3Yb/QQ3QWqpQL7MENVe
jpFnUeCg/d89xNpxLg29oNRd+JvxcqBW4hSPxiB/TCA4Q5vCKS9UO1Kq+R4SOB35
tDvlMgZUYwKBgFW6SR8L3/tbRs5MseNLdXKke/bkPcQ2FQiZ6UxsVEQi8GYwEu4O
WYyDiQ/ilTekmqJMp7WqoOKoaS5RmnpJnUGkcPkmBbrTfDRpqwfaUlUeLChyK4mQ
dYmOYO+DQpsNhzq9P0D2vn9Stl/MPLtZye/us5CCoYCWsxQxk7he0u9lAoGBAKL8
ERM7Dmx/cwDqKCGn8rvF9KDxCGg+Nwycg4PPTkLhzrQmRirbIscUqmSOxI5ZclJz
HgI4VLl1debJhzqZQPF6DKFNXTD8g7f6bJfX5Xgig1T0Mtc6KCNhIOLtcBCloyax
JS7eLcv7FTlfgoopVq9AOZl2IT1/pKoSBY3cI1QtAoGAUsgOF/uUFC57Lk0+z13l
2Y8uJ0e2HEPaDbo85+E1xdXRRpGadT1oTN/wEjQSe6xX6u4JTD8IwUiKtLPN3yb2
TzWMxt4pJjXfjKd+LDlGHBYTwDeGRjOyNCISNlvCci5gqZM5jgHDsby/ebWOwgHX
hFz/Za2yww+RU7UrkVI14gM=
-----END PRIVATE KEY-----
`;
// The initial backoff time after a disconnection occurs, in seconds.
const MINIMUM_BACKOFF_TIME = 1;

// The maximum backoff time before giving up, in seconds.
const MAXIMUM_BACKOFF_TIME = 32;

// Whether to wait with exponential backoff before publishing.
let shouldBackoff = false;

// The current backoff time.
let backoffTime = 1;

// Whether an asynchronous publish chain is in progress.
let publishChainInProgress = false;

console.log("Google Cloud IoT Core MQTT example.");

// Create a Cloud IoT Core JWT for the given project id, signed with the given
// private key.
// [START iot_mqtt_jwt]
const createJwt = (projectId, prv_key, algorithm) => {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    aud: projectId,
  };
  const privateKey = Buffer.from(prv_key, "utf8");

  return jwt.sign(token, privateKey, { algorithm: algorithm });
};

const projectId = `clearblade-ipm`;
const deviceId = `mqtt-testing-device`;
const registryId = `mqtt-testing-registry`;
const region = `us-central1`;
const algorithm = `RS256`;
const privateKeyFile = `./rsa_private.pem`;
const mqttBridgeHostname = `mqtt.googleapis.com`;
const mqttBridgePort = 8883;
const messageType = `events`;
const numMessages = 1;
const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`;

const connectionArgs = {
  host: mqttBridgeHostname,
  port: mqttBridgePort,
  clientId: mqttClientId,
  username: "unused",
  password: createJwt(projectId, prv_key, algorithm),
  protocol: "mqtts",
  secureProtocol: "TLSv1_2_method",
};

// Create a client, and connect to the Google MQTT bridge.
const iatTime = parseInt(Date.now() / 1000);
const client = mqtt.connect(connectionArgs);

// Subscribe to the /devices/{device-id}/config topic to receive config updates.
// Config updates are recommended to use QoS 1 (at least once delivery)
client.subscribe(`/devices/${deviceId}/config`, { qos: 1 });

// Subscribe to the /devices/{device-id}/commands/# topic to receive all
// commands or to the /devices/{device-id}/commands/<subfolder> to just receive
// messages published to a specific commands folder; we recommend you use
// QoS 0 (at most once delivery)
client.subscribe(`/devices/${deviceId}/commands/#`, { qos: 0 });

// The MQTT topic that this device will publish data to. The MQTT topic name is
// required to be in the format below. The topic name must end in 'state' to
// publish state and 'events' to publish telemetry. Note that this is not the
// same as the device registry's Cloud Pub/Sub topic.
const mqttTopic = `/devices/${deviceId}/${messageType}`;

client.on("connect", (success) => {
  console.log("connect");
  if (!success) {
    console.log("Client not connected...");
  } else {
    client.publish(mqttTopic, "hello from ClearBlade again ", (msg) => {
      console.log(msg);
    });

    //client.publish(mqttTopic, client, iatTime, 1, numMessages, connectionArgs);
  }
});
