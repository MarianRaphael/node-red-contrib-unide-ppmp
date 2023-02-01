# Node-RED PPMP node

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
![NPM version](https://badge.fury.io/js/node-red-dashboard.svg)
![NPM](https://img.shields.io/npm/l/node-red-dashboard)

## Pre-requisites

The Node-RED-PPMP requires [Node-RED](https://nodered.org) to be installed.

## Install

To install the stable version use the `Menu - Manage palette` option and search for `node-red-unide-ppmp`, or run the following command in your Node-RED user directory - typically `~/.node-red`:

    npm i node-red-contrib-unide-ppmp

## Exampels

See also [Exampels](/exampels/)

## Production Performance Management Protocol (PPMP)

The Production Performance Management Protocol (PPMP) specifies a format that allows to capture data that is required to do performance analysis of production facilities. It allows monitoring backends to collect and evaluate key metrics of machines in the context of a production process. It is doing that by allowing to relate the machine status with currently produced parts.

The specification is structured into two payload formats: Measurement payload and message payload. The Measurement payload contains measurements from machines such as the temperature of a machine at a specific point in time together with the currently produced part. The message payload contains arbitrary messages sent by a machine, e.g. alerts or the like.

The payload is meant to be transported via http as a json object. This allows for an easy integration into various backend systems.

### Measurement Payload

The measurement message is the format to exchange simple (non-structured, non-complex ) measurement data. It also allows to transport multiple measurement data (eg. values over time), called 'series'.

#### Version 2

[See schema](/schemas/v2/measurement_schema.md)

<img src="/images/v2/measurementPayload.svg" title="" alt="" data-align="center">

##### Example - Measurement v2

```json
{
  "content-spec": "urn:spec://eclipse.org/unide/measurement-message#v2",
  "device": {
    "deviceID": "a4927dad-58d4-4580-b460-79cefd56775b"
  },
  "measurements": [
    {
      "ts": "2002-05-30T09:30:10.123+02:00",
      "series": {
        "$_time": [0, 23, 24],
        "temperature": [45.4231, 46.4222, 44.2432]
      }
    },
    {
      "ts": "2002-05-30T09:30:10.123+02:00",
      "series": {
        "$_time": [0, 13, 26],
        "pressure": [52.4, 46.32, 44.2432]
      }
    }
  ]
}
```

#### Version 3

[See schema](/schemas/v3/measurement_schema.md)

<img src="/images/v3/measurementPayload.svg" title="" alt="" data-align="center">

##### Example - Measurement v3

```json
{
  "content-spec": "urn:spec://eclipse.org/unide/measurement-message#v3",
  "device": {
    "id": "a4927dad-58d4-4580-b460-79cefd56775b"
  },
  "measurements": [
    {
      "ts": "2023-02-01T19:15:28.607Z",
      "series": {
        "time": [0],
        "temp": [0.8493]
      }
    }
  ]
}
```

### Machine Message Payload

The main purpose of the machine message format is to allow devices and integrators to send messages containing an interpretation of measurement data or status.

#### Version 2

[See schema](/schemas/v2/message_schema.md)

!<img src="/images/v2/messagePayload.svg" title="" alt="" data-align="center">

##### Example Machine Message v2

```json
{
  "content-spec": "urn:spec://eclipse.org/unide/machine-message#v2",
  "device": {
    "deviceID": "2ca5158b-8350-4592-bff9-755194497d4e"
  },
  "messages": [
    {
      "ts": "2002-05-30T09:30:10.123+02:00",
      "code": "190ABT"
    }
  ]
}
```

#### Version 3

[See schema](/schemas/v3/message_schema.md)

<img src="/images/v3/messagePayload.svg" title="" alt="" data-align="center">

##### Example Machine Message v3

```json
{
  "content-spec": "urn:spec://eclipse.org/unide/machine-message#v3",
  "device": { 
    "id": "2ca5158b-8350-4592-bff9-755194497d4e" 
  },
  "messages": [
    { 
      "ts": "2023-02-01T19:44:58.969Z", 
      "code": "testCode"
    }
  ]
}
```

## Process Message Payload

The process message is the format to exchange data out of discrete processes. It also allows to transport process information, part information and measurement data for each phase of the process

#### Version 2

[See schema](/schemas/v2/process_schema.md)

<img src="/images/v2/processPayload.svg" title="" alt="" data-align="center">

##### Example Process Message v2

...

#### Version 3

[See schema](/schemas/v3/process_schema.md)

<img src="/images/v3/processPayload.svg" title="" alt="" data-align="center">

##### Example Process Message v3

....
