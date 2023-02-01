# Node-RED PPMP node

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
![NPM](https://img.shields.io/npm/l/node-red-dashboard)

## Pre-requisites

The Node-RED-PPMP requires [Node-RED](https://nodered.org) to be installed.

## Install

To install the stable version use the `Menu - Manage palette` option and search for `node-red-unide-ppmp`, or run the following command in your Node-RED user directory - typically `~/.node-red`:

    npm i node-red-contrib-unide-ppmp


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

<img src="/images/v2/messagePayload.svg" title="" alt="" data-align="center">

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

### Process Message Payload

The process message is the format to exchange data out of discrete processes. It also allows to transport process information, part information and measurement data for each phase of the process

#### Version 2

[See schema](/schemas/v2/process_schema.md)

<img src="/images/v2/processPayload.svg" title="" alt="" data-align="center">

##### Example Process Message v2

```json
{
  "content-spec": "urn:spec://eclipse.org/unide/process-message#v2",
  "device": { 
    "deviceID": "2ca5158b-8350-4592-bff9-755194497d4e" 
  },
  "process": { 
    "ts": "2023-02-01T19:48:30.150Z" 
  },
  "measurements": [
    {
      "ts": "2023-02-01T19:48:30.150Z",
      "series": {
        "force": [0.8493, 0.566, 5455],
        "pressure": [0.8493, 0.566, 5455]
      }
    }
  ]
}
```

#### Version 3

[See schema](/schemas/v3/process_schema.md)

<img src="/images/v3/processPayload.svg" title="" alt="" data-align="center">

##### Example Process Message v3

```json
{
  "content-spec": "urn:spec://eclipse.org/unide/process-message#v3",
  "device": {
    "id": "2ca5158b-8350-4592-bff9-755194497d4e"
  },
  "process": {
    "ts": "2023-02-01T19:47:17.170Z"
  },
  "measurements": [
    {
      "ts": "2023-02-01T19:47:17.170Z",
      "series": {
        "force": [0.8493, 0.566, 5455],
        "pressure": [0.8493, 0.566, 5455]
      }
    }
  ]
}
```
## Example flow

See also [Examples](/examples/)

```json
[
    {
        "id": "a151bd9d2a567181",
        "type": "tab",
        "label": "Example PPMP",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "f4987da60e67e217",
        "type": "inject",
        "z": "a151bd9d2a567181",
        "name": "multiple message",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "{\"force\":[0.8493,0.566],\"pressure\":[0.8493,0.566]}",
        "payloadType": "json",
        "x": 200,
        "y": 260,
        "wires": [
            [
                "c73720c4187d76f7",
                "433ef75572dd6a14"
            ]
        ]
    },
    {
        "id": "ded20c49c6b2dc12",
        "type": "inject",
        "z": "a151bd9d2a567181",
        "name": "single message",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "{\"temp\":[0.8493]}",
        "payloadType": "json",
        "x": 200,
        "y": 180,
        "wires": [
            [
                "c73720c4187d76f7"
            ]
        ]
    },
    {
        "id": "21e0ffafa3811e4c",
        "type": "inject",
        "z": "a151bd9d2a567181",
        "name": "code message",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "testCode",
        "payloadType": "str",
        "x": 200,
        "y": 360,
        "wires": [
            [
                "b835d254a9e6f65b"
            ]
        ]
    },
    {
        "id": "c73720c4187d76f7",
        "type": "PPMP-Measurement",
        "z": "a151bd9d2a567181",
        "name": "",
        "version": "3",
        "deviceId": "testDevice",
        "inputs": 1,
        "outputs": 1,
        "x": 450,
        "y": 180,
        "wires": [
            [
                "257a4c628d82dd9a",
                "79891cd68a42aae3"
            ]
        ]
    },
    {
        "id": "433ef75572dd6a14",
        "type": "PPMP-Process",
        "z": "a151bd9d2a567181",
        "name": "",
        "version": "3",
        "deviceId": "testDevice",
        "inputs": 1,
        "outputs": 1,
        "x": 460,
        "y": 260,
        "wires": [
            [
                "4f6053be7196c47a",
                "79891cd68a42aae3"
            ]
        ]
    },
    {
        "id": "b835d254a9e6f65b",
        "type": "PPMP-Message",
        "z": "a151bd9d2a567181",
        "name": "",
        "version": "3",
        "deviceId": "testDevice",
        "inputs": 1,
        "outputs": 1,
        "x": 460,
        "y": 360,
        "wires": [
            [
                "7a0be859f0bdba49",
                "79891cd68a42aae3"
            ]
        ]
    },
    {
        "id": "4f6053be7196c47a",
        "type": "debug",
        "z": "a151bd9d2a567181",
        "name": "debug two",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 670,
        "y": 260,
        "wires": []
    },
    {
        "id": "257a4c628d82dd9a",
        "type": "debug",
        "z": "a151bd9d2a567181",
        "name": "debug one",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 670,
        "y": 180,
        "wires": []
    },
    {
        "id": "7a0be859f0bdba49",
        "type": "debug",
        "z": "a151bd9d2a567181",
        "name": "debug three",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 670,
        "y": 360,
        "wires": []
    },
    {
        "id": "79891cd68a42aae3",
        "type": "http request",
        "z": "a151bd9d2a567181",
        "name": "",
        "method": "POST",
        "ret": "txt",
        "paytoqs": "ignore",
        "url": "http://127.0.0.1:1880/ppmp",
        "tls": "",
        "persist": false,
        "proxy": "",
        "insecureHTTPParser": false,
        "authType": "",
        "senderr": false,
        "headers": [],
        "x": 970,
        "y": 260,
        "wires": [
            [
                "08af9e81dc0a6fe2"
            ]
        ]
    },
    {
        "id": "08af9e81dc0a6fe2",
        "type": "debug",
        "z": "a151bd9d2a567181",
        "name": "response debug",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 1180,
        "y": 260,
        "wires": []
    },
    {
        "id": "a4c8aed7859db94b",
        "type": "http in",
        "z": "a151bd9d2a567181",
        "name": "",
        "url": "/ppmp",
        "method": "post",
        "upload": false,
        "swaggerDoc": "",
        "x": 190,
        "y": 480,
        "wires": [
            [
                "25add09707dd429d",
                "11a67b1ff49701d5"
            ]
        ]
    },
    {
        "id": "25add09707dd429d",
        "type": "http response",
        "z": "a151bd9d2a567181",
        "name": "",
        "statusCode": "",
        "headers": {},
        "x": 370,
        "y": 480,
        "wires": []
    },
    {
        "id": "11a67b1ff49701d5",
        "type": "debug",
        "z": "a151bd9d2a567181",
        "name": "debug input",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 390,
        "y": 540,
        "wires": []
    }
]
```