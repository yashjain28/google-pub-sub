import getRandomValues from "polyfill-crypto.getrandomvalues";

// @ts-ignore
global.crypto = { getRandomValues };
