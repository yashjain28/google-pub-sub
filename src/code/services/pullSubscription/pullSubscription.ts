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

function pullSubscription(req, resp) {
  // These are parameters passed into the code service
  var params = req.params;
  ClearBlade.init({ request: req });
  const messaging = ClearBlade.Messaging();
  const http = Requests();
  const pubsubBaseUrl = GoogleSubConfig.PUB_SUB_API_BASE;
  const projectID = GoogleSubConfig.PROJECT_ID;
  const subscriptionName = GoogleSubConfig.SUBSCRIPTION_NAME;
  const subscription = `projects/${projectID}/subscriptions/${subscriptionName}`;
  const pullSuffix = GoogleSubConfig.PULL_URL_SUFFIX;
  const ackSuffix = GoogleSubConfig.ACK_URL_SUFFIX;
  const maxMessages = GoogleSubConfig.MAX_MESSAGES_TO_PULL || 10;
  const pullUrl = `${pubsubBaseUrl}/${subscription}${pullSuffix}?alt=json`;
  const ackUrl = `${pubsubBaseUrl}/${subscription}${ackSuffix}`;
  log("pullUrl: ", pullUrl);
  log("ackUrl: ", ackUrl);
  const cache = ClearBlade.Cache("AccessTokenCache");

  const client = new MQTT.Client();

  function onMessage(topic, message) {
    log("Fetching new Messages from Google pubsub... ", topic, message.payload);
    cache.get("accessToken", function (err, data) {
      if (err) {
        log("Error: ", data);
        resp.error("problem setting access token" + data);
      }
      const access_token = data;
      fetchMessages(access_token);
    });

    function fetchMessages(access_token) {
      const getMessageOptions = {
        uri: pullUrl,
        body: {
          maxMessages,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      };

      http.post(getMessageOptions, function (err, data) {
        if (err) {
          log("http.post error for getting messages", data);
          log(
            "MAYBE, a google imposed restriction: https://cloud.google.com/pubsub/docs/reference/rest/v1/projects.subscriptions/pull"
          );
          resp.error(data);
        }
        const messages = JSON.parse(data);
        let ackIds = [];
        for (var i in messages.receivedMessages) {
          var recvMsg = messages.receivedMessages[i];
          log(Base64.decode(recvMsg.message.data));
          messaging.ackIds.push(recvMsg.ackId);
        }
        if (ackIds.length > 0) {
          acknowledgeBack(access_token, ackIds);
        }
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
          log("error in acknowledgement: ", data);
          resp.error(data);
        }
      });
    }
  }

  log("subscribing now...");
  client.subscribe("$timer/pullTimer", onMessage).catch(function (reason) {
    resp.error("failed to subscribe: " + reason.message);
  });
}

global.pullSubscription = pullSubscription;
