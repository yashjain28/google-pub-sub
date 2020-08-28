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

import getRandomValues from "polyfill-crypto.getrandomvalues";

global.crypto = { getRandomValues };

import jwt from "jsonwebtoken";

const algorithm = `RS256`;
const email = "pubsubnimbelink@clearblade-ipm.iam.gserviceaccount.com";
const keyy =
  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDAMO33tkXDsDFm\nb6k9aUmeixZs6ae30wMufb26TVV+G3fN0mFqRFixsUccs/FlNuLvNvQaXcj4nnie\naQA2yQiqAzSc9rcKC4pIHb6l782qPx074ILUgDwpLLuFj0yitSBhu7MVCjJllCYM\ncnkxJFu2Yb5MMsytn5X1v7YIVF+dmSDaQ6xW3QyNFMZ/qHf38YINMag0A2wGwFGl\nKE39GvXR7yD3jy0+s995XQwXAVF6zNA2Z3k1eWz5KgwhO13zF6L++t0R1t2ePcOr\nwgthp0PDNhA925KKduMI7vobJhTtyf6y6i/wA3EKt3T9oyBZxLYSSSDkhDmCTA/1\nwEzbDafxAgMBAAECggEAA4uDgCuyWrsvwL9zhDNNIn8B8WKtRMnqx5tAeiS+Bx7z\nlUN5p4T44SzaGRtFQG7ZkxGqQVLp3OgeD8dJCTmpDsBot90hytjOpVONy4Vs/48S\nzM1wgayXL30955Hulxu3LAZTIHgOg5V5eYZNBPfc4d7TV0LNSAXnCrWNYoGdPTdo\ncSGs3HOxFxIrpKJvNCFTraP9QcM18P3PN2n4U9BCkQT5pCkAri9vpqYgSfF75tNc\ndgqeboH0c5f299OM/j49aBK5LqKcSkMR240o5/A3uH4eXknpBk3Zxbbygrgke1vz\nbeVSqxyKcIY6sST2/yh8I5mBKfa7X1yD5cxoSS2MAQKBgQD7kg0lI8dEv1jZsyjI\nJMCoFwZySEKBBGjXb0yeFBJsmo4dJl72/um0avm70axaHkG9fkaZ+u1haue0VOkn\nbysYf8RsunDg/+K5HXVn3SYgQAzRX74yZLHf/t0Rgn/R7Gjm2l30JybkqFmXOmQb\nMyOnneYlN/aJFra+iKI0u/U5gQKBgQDDkzoYM+vFB72J3vEpXqxSOJhd5JhtB/ih\nBhBDEZrcvMm9F1NmdWogu1lWieyhLKBm0Hcs/mRPj3EPu7FfiY6obpic4Rh+QGSL\ntm1L24R+Uazbh53SLY+g50HT6boFIbBphHSJV97wC64MNA2unXBABvmIwgAC7ANQ\nuXfeZRZGcQKBgQDzHDgxzPqT+Co/74AYslOv3Nhw9l22WnGKx9cN6K3JYC64As3A\n+aUVok+GbuCVEipLmk1WHoTqIKqbvXa3khneihJjVGUjOoV6iPpdjfx7LAp3B4RB\nJMg0hBJVCnzFfCX/+cTT3kYasIort9Tn6Cqrn8655vQLlPSy+k1ukrkvgQKBgQCl\nkaxq9Pmykfz6DU1o0odcDCGhy3bnRwpLd9Coluzd1s2LUYX/hYNVNoZJZvZ29ErO\n/8kExFCzsiHrSeC9mry1BvwYQ8/ygh0c0lHxGGQwdIC8UTFgz8V6WI04E/Sxh3XL\nvqDR7RwFaD3ugtraatquubji+Cn+T0P3QSyjkDytYQKBgAP9h/w2HKUDIVSAPfZj\nHnh+c6rETsKYaRQHdP6anhG1hmxh5qGIGCBb540vjL6d7qP1gdPa2aMpjB4Y1pky\nc9YHdBBbDzMuOFDQdisQewARavgqStiXVK1RjKRmUXJmmoNPdJfxt3G0O5kmEFwm\nwsZJN/X3MtEIlcts7gecCnOv\n-----END PRIVATE KEY-----\n";
const createJwt = (service_account_email, prv_key, algorithm) => {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    //aud: projectId,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/pubsub",
    iss: service_account_email,
  };
  const privateKey = Buffer.from(prv_key, "utf8");

  return jwt.sign(token, privateKey, { algorithm: algorithm });
};
const jwtToken = createJwt(email, keyy, algorithm);

function googlePullSubscription(req, resp) {
  // These are parameters passed into the code service
  var params = req.params;

  const jwtToken = createJwt(email, keyy, algorithm);
  const http = Requests();
  const pubsubBaseUrl = GoogleSubConfig.PUB_SUB_API_BASE;
  const projectID = GoogleSubConfig.PROJECT_ID;
  const subscriptionName = GoogleSubConfig.SUBSCRIPTION_NAME;
  const subscription = `projects/${projectID}/subscriptions/${subscriptionName}`;
  const pullSuffix = GoogleSubConfig.PULL_URL_SUFFIX;
  const ackSuffix = GoogleSubConfig.ACK_URL_SUFFIX;

  const pullUrl = `${pubsubBaseUrl}/${subscription}${pullSuffix}?alt=json`;
  const ackUrl = `${pubsubBaseUrl}/${subscription}${ackSuffix}`;
  log("pullUrl: ", pullUrl);
  log("ackUrl: ", ackUrl);
  const options = {
    uri: "https://oauth2.googleapis.com/token",
    body: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwtToken,
    },
  };
  http.post(options, function (err, data) {
    if (err) {
      resp.error(data);
    }
    const retData = JSON.parse(data);
    const access_token = retData.access_token;
    fetchMessages(access_token);
  });

  function fetchMessages(access_token) {
    const getMessageOptions = {
      uri: pullUrl,
      body: {
        maxMessages: 10,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
    };
    http.post(getMessageOptions, function (err, data) {
      if (err) {
        log(data);
        resp.error(data);
      }
      //log(data)
      const messages = JSON.parse(data);
      let ackIds = [];
      for (var i in messages.receivedMessages) {
        log(messages.receivedMessages[i]);
        var recvMsg = messages.receivedMessages[i];
        log(base_64.decode(recvMsg.message.data));
        ackIds.push(recvMsg.ackId);
      }

      acknowledgeBack(access_token, ackIds);
    });
  }

  function acknowledgeBack(access_token, ackIds) {
    const ackMessageOptions = {
      uri: ackUrl,
      body: {
        ackIds,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
    };
    http.post(ackMessageOptions, function (err, data) {
      if (err) {
        log(data);
        resp.error(data);
      }
      resp.success(data);
    });
  }
}

global.googlePullSubscription = googlePullSubscription;
