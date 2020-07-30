var crypto = require("crypto");

var generateSasToken = function (
  resourceUri,
  signingKey,
  policyName,
  expiresInMins
) {
  resourceUri = encodeURIComponent(resourceUri);

  // Set expiration in seconds
  var expires = Date.now() / 1000 + expiresInMins * 60;
  expires = Math.ceil(expires);
  var toSign = resourceUri + "\n" + expires;

  // Use crypto
  var hmac = crypto.createHmac("sha256", Buffer.from(signingKey, "base64"));
  hmac.update(toSign);
  var base64UriEncoded = encodeURIComponent(hmac.digest("base64"));

  // Construct authorization string
  var token =
    "SharedAccessSignature sr=" +
    resourceUri +
    "&sig=" +
    base64UriEncoded +
    "&se=" +
    expires;
  if (policyName) token += "&skn=" + policyName;
  return token;
};

var endpoint = "mqtt-testing-hub.azure-devices.net/devices/mqtt-testing-device";
var deviceKey = "Plcw230Fkv7rVxjiBsPzyKUmjlU5+R6l/p3ceH0fM3o=";

var token = generateSasToken(endpoint, deviceKey, null, 60);

console.log(token);
