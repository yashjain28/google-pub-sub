import getRandomValues from "polyfill-crypto.getrandomvalues";

global.crypto = { getRandomValues };

import jwt from "jsonwebtoken";

const createJwt = (
  service_account_email,
  prv_key,
  algorithm,
  scope,
  expiryPeriodInSecs
) => {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + expiryPeriodInSecs, // 20 minutes
    aud: "https://oauth2.googleapis.com/token",
    scope: scope,
    iss: service_account_email,
  };
  const privateKey = Buffer.from(prv_key, "utf8");

  return jwt.sign(token, privateKey, { algorithm: algorithm });
};

function accessTokenManager(req, resp) {
  const http = Requests();
  const algorithm = GoogleIoTConfig.ALGORITHM || `RS256`;
  const expiryPeriodInSecs = GoogleIoTConfig.TOKEN_EXPIRY_PERIOD_IN_SECS;
  const email = GoogleIoTConfig.SERVICE_EMAIL;
  const serviceAccountPrviateKey =
    GoogleIoTConfig.SUBSCRIPTION_SERVICE_ACCOUNT_PRIVATE_KEY;
  const scope =
    GoogleIoTConfig.AUTH_SCOPE || "https://www.googleapis.com/auth/pubsub";
  const jwtToken = createJwt(
    email,
    serviceAccountPrviateKey,
    algorithm,
    scope,
    expiryPeriodInSecs
  );

  ClearBlade.init({ request: req });
  const cache = ClearBlade.Cache("AccessTokenCache");

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

    cache.set("accessToken", access_token, function (err, data) {
      if (err) {
        log("Error: ", data);
        resp.error("problem setting access token" + data);
      }
      log("successfully set cache data: ", data);
      resp.success(data);
    });
  });
}

global.accessTokenManager = accessTokenManager;
