/**
 * Type: Micro Service
 * Description: A short-lived service which is expected to complete within a fixed period of time.
 * @param {CbServer.BasicReq} req
 * @param {string} req.systemKey
 * @param {string} req.systemSecret
 * @param {string} req.userEmail
 * @param {string} req.userid
 * @param {string} req.userToken
 * @param {boolean} req.isLogging
 * @param {[id: string]} req.params
 * @param {CbServer.Resp} resp
 */

global.crypto = require("crypto-js");
global.crypto.getRandomValues = require("polyfill-crypto.getrandomvalues");

const buffer = require("buffer/").Buffer;
const jwt = require("jsonwebtoken");
//global.crypto = require("crypto-js");
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

function mqttDeviceClient(req, resp) {
  // These are parameters passed into the code service
  log("Google Cloud IoT Core MQTT example.");

  var params = req.params;
  var options = {
    address: mqttBridgeHostname,
    port: mqttBridgePort,
    client_id: mqttClientId,
    use_tls: true,
    username: "testing123",
    password: createJwt(projectId, prv_key, algorithm),
  };
  var deviceData = {
    data: 91,
    deviceID: "myDevice",
  };
  var info =
    "Data on device: " + deviceData.deviceID + " is " + deviceData.data;
  var client = new MQTT.Client(options);
  client.publish(TOPIC, info).then(
    function (resolve) {
      log(resolve);
      resp.success("success");
    },
    function (reason) {
      log(
        "failed to publish device data " + deviceData + ": " + reason.message
      );
      resp.error("failure");
    }
  );
}

global.mqttDeviceClient = mqttDeviceClient;
