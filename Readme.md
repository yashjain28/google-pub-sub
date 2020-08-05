
# ipm package: google-iot-mqtt-client

## Overview

This package is a template system to connect with Google Cloud using MQTT to publish data & subscribe to device config data. It involves authenticating and then publishing data as a device.

[Browse ipm Packages](https://ipm.clearblade.com)

## Setup

1. Setup on Gcloud:
	Following steps are assuming user already has an account and has access to Gcloud IoT Console.
    1. First perform the [Iot core quickstart](https://cloud.google.com/iot/docs/quickstart): This will involve creating a device, device registry & a certificate, creating a topic and a subscription.
   
2. Setup on ClearBlade:
   1. Get the Desired Credentials and update the [Google IoT Configuration Library](code/libraries/GoogleIoTConfig/GoogleIoTConfig.js).
   2. Get the `PROJECT_ID`, `DEVICE_ID`, `REGISTRY_ID`, `REGION`, `MQTT_BRIDGE_HOSTNAME`, `PRIVATE_KEY` from the IoT core quickstart step. One may need to refer this section on gcloud for [generating private/public key pairs](https://cloud.google.com/iot/docs/how-tos/credentials/keys#device_authentication).

## Usage

As a developer, you can publish as a device to the cloud and subscribe to device config. 

* Browse to the [mqtt client publish service](code/services/mqttDeviceClient/mqttDeviceClient.js):

    1. Pass in params, by clicking the `edit params` section on the code page of the ClearBlade console. The data to be published should be in the `data` key of the params object. Ex: `{ "data":"my device temperature is 90F"}`.
    2. The MQTT topic will be generated from the above constants. 
    3. Save and Test the service (This service only needs to be executed once).
    4. Do a pull on the subscription you created on Glcoud to test it. The instructions for that exist in the quickstart guide as well.

* Browse to the [mqtt client subscribe service](code/services/mqttDeviceClientSubscribe/mqttDeviceClientSubscribe.js):
    1. Save and Test the service (This service will run as a stream service and wait on messages).
    2. Check the service logs or the test topic in the messaging page on ClearBlade to the received messages, which the service forwards to ClearBlade's native MQTT broker.

## Assets

### Code Services

* `mqttDeviceClient` -- a service which publishes data, which is passed as params when invoking the service.
* `mqttDeviceClientSubscribe` -- a service which subscribes to the following topics by default, the values are replaced from the config library.
  * `/devices/${deviceId}/${messageType}`
  * `/devices/${deviceId}/config`
  * `/devices/${deviceId}/commands/#`

### Code Libraries

`GoogleIoTConfig` -- a configuration library, which holds constants specific to Google IoT.
