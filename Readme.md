
# ipm package: google-pub-sub

## Overview

This package is a template system to connect with Google Cloud using REST subscribe to topics. It uses the Pull Subscription approach for subscription. 

[Browse ipm Packages](https://ipm.clearblade.com)

## Setup

|Gcloud Setup Summary|
|:---|
|[Create Gcloud account](https://cloud.google.com/billing/docs/how-to/manage-billing-account)|
|[Create a project in gcloud](https://cloud.google.com/resource-manager/docs/creating-managing-projects)|
|[Create a topic(optional)](https://cloud.google.com/pubsub/docs/quickstart-console#create_a_topic)|
|[Create a subscription for the desired topic](https://cloud.google.com/pubsub/docs/quickstart-console#add_a_subscription)|
|[Create a service account](https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount)|

1. Setup on Gcloud Detailed:
	Following steps are assuming user already has an account and has access to Gcloud IoT Console.
    1. If you already have a project created and also have a topic which you wish to subscribe to, then directly go to step 3.
    2. Perform the [Iot core quickstart](https://cloud.google.com/iot/docs/quickstart): This will involve creating a device, device registry & a certificate, creating a topic and a subscription.
    3. Now that you have a topic in a project to subscribe to, create a pull subscription if you don't already have one. Follow this link to [create a pull subscription](https://cloud.google.com/pubsub/docs/pull). 
    4. We use a service account to perform the pull subscription over HTTP REST. Follow the steps here to [create a service account on google and generate a key](https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount). This key is used to generate access token that is used to perform the pull and acknowledgement. Things to note here are:
       1. default maximum validity for access token is 3600 seconds.
       2. The additional steps to increase the default maximum validity for access token are [here](https://cloud.google.com/resource-manager/docs/organization-policy/restricting-service-accounts#extend_oauth_ttl)
2. Setup on ClearBlade:
   1. Get the Desired Credentials and update the [Google IoT Configuration Library](code/libraries/GoogleIoTConfig/GoogleIoTConfig.js). The credentials include `PROJECT_ID`, `MAX_MESSAGES_TO_PULL`, `SUBSCRIPTION_NAME`, `SUBSCRIPTION_SERVICE_ACCOUNT_PRIVATE_KEY` from the above Gcloud checklist summary.
   2. Restart the pullSubscription service once the GoogleIoTConfig Library is updated.
   3. Update the `pullTimer` and `updateAccessTokenTimer` based on your use-case.

## Usage

The [accessTokenManager](src/code/services/accessTokenManager/accessTokenManager.ts) service listens on a timer to fetch a new access token. The reason we do that is the expiry time of an access token is limited, a maximum of 3600s. This service updates the AccessToken in a shared cache, which is used by the [pullSubscription](code/services/pullSubscription/pullSubscription.js) service to make a pull to the subscription.


Note: One can manually update the access token in the shared cache, by simply invoking the `accessTokenManager` service.

## Assets

### Code Services

* `accessTokenManager` -- a service that uses the private for a service account along with other credentials in the `GoogleIoTConfig` library to gain the access token and update the shared cache with the latest access_token. This service runs of a timer, updateAccessTokenTimer. The frequency of execution of this timer should be less than 3600s, since the access_token has a maximum expiry time of 3600s. 
* `pullSubscription` -- a stream service which regularly pulls on a topic. The determine of pull's is defined by the pullTimer. If the pullTimer fires every 20 seconds, then the service makes a pull to the topic on google every 20 seconds. It reads the accessToken from the shared cache which is updated regularly by the `accessTokenManager` service.

### Code Libraries

`GoogleIoTConfig` -- a configuration library, which holds constants specific to Google IoT.

### Timers

The timers can be updated based on your use-case:

* `pullTimer` - this timer defines the frequency of your pull.
* `updateAccessTokenTimer` - this timer defines the frequency at which the access token gets updated.

### Shared Cache

`AccessTokenCache` - this cache stores the latest and active access_token. The expiry time for this cache is set to 3600s.