/**
 * Type: Configuration
 * Description: A library that contains a key-value object to be used as constants.
 */

/**
 * Type: Configuration
 * Description: A library that contains a key-value object to be used as constants.
 */

const servicePrivateKey = "<PRIVATE_KEY>"; // Follow instructions here for creating the service account key https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount

// Using http REST for Auth, refer this link on Google Docs for more information: https://developers.google.com/identity/protocols/oauth2/service-account#top_of_page
const GoogleIoTConfig = {
  PROJECT_ID: "<PROJECT_ID>", // Project ID on Google
  ALGORITHM: "RS256",
  SUBSCRIPTION_SERVICE_ACCOUNT_PRIVATE_KEY: servicePrivateKey,
  SERVICE_EMAIL: "<SERVICE_ACCOUNT_EMAIL>", //
  AUTH_SCOPE: "https://www.googleapis.com/auth/pubsub", // this scope is a must for pubsub, refer https://developers.google.com/identity/protocols/oauth2/service-account#authorizingrequests
  TOKEN_EXPIRY_PERIOD_IN_SECS: 3600, // refer google docs for more information https://developers.google.com/identity/protocols/oauth2/service-account#authorizingrequests
};

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

// const servicePrivateKey = "<PRIVATE_KEY>";

// const GoogleIoTConfig = {
//   PROJECT_ID: "clearblade-ipm",
//   REGION: "us-central1",
//   ALGORITHM: "RS256",
//   PRIVATE_KEY: prv_key,
// };
