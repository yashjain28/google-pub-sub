/**
 * Type: Configuration
 * Description: A library that contains a key-value object to be used as constants.
 */

const servicePrivateKey = "<PRIVATE_KEY>";

const GoogleSubConfig = {
  SUBSCRIPTION_SERVICE_ACCOUNT_PRIVATE_KEY: servicePrivateKey,
  PROJECT_ID: "<PROJECT_ID>",
  SUBSCRIPTION_NAME: "<SUBSCRIPTION_NAME>",
  PUB_SUB_API_BASE: "https://pubsub.googleapis.com/v1",
  PULL_URL_SUFFIX: ":pull",
  ACK_URL_SUFFIX: ":acknowledge",
  MAX_MESSAGES_TO_PULL: 10, // refer https://cloud.google.com/pubsub/docs/reference/rest/v1/projects.subscriptions/pull
  FORWARD_TO_CB_TOPIC: true,
  CB_TOPIC: "incomingFromGoogleSub", // can be replaced with one's own
};
