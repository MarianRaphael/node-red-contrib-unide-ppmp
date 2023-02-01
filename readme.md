# Production Performance Management Protocol (PPMP)

The Production Performance Management Protocol (PPMP) specifies a format that allows to capture data that is required to do performance analysis of production facilities. It allows monitoring backends to collect and evaluate key metrics of machines in the context of a production process. It is doing that by allowing to relate the machine status with currently produced parts.

The specification is structured into two payload formats: Measurement payload and message payload. The Measurement payload contains measurements from machines such as the temperature of a machine at a specific point in time together with the currently produced part. The message payload contains arbitrary messages sent by a machine, e.g. alerts or the like.

The payload is meant to be transported via http as a json object. This allows for an easy integration into various backend systems.

<img title="" src="file:///Users/marian/Desktop/Screenshot%202023-02-01%20at%2011.56.08.png" alt="" data-align="center">

## Measurement Payload

The measurement message is the format to exchange simple (non-structured, non-complex ) measurement data. It also allows to transport multiple measurement data (eg. values over time), called 'series'.

#### Version 2

[See schema](/schemas/v2/measurement_schema.md)

##### Example

```json
{
  "content-spec": "urn:spec://eclipse.org/unide/measurement-message#v2",
  "device": {
    "deviceID": "a4927dad-58d4-4580-b460-79cefd56775b"
  },
  "measurements": [{
    "ts": "2002-05-30T09:30:10.123+02:00",
    "series": {
      "$_time" : [ 0, 23, 24 ], 
      "temperature" : [ 45.4231, 46.4222, 44.2432]
    }
  }, {
    "ts": "2002-05-30T09:30:10.123+02:00",
    "series": {
      "$_time" : [ 0, 13, 26 ],
      "pressure" : [ 52.4, 46.32, 44.2432 ]
    }
  }]
}
```

#### Version 3

[See schema](/schemas/v3/measurement_schema.md)

##### Example

...

# Machine Message Payload

The main purpose of the machine message format is to allow devices and integrators to send messages containing an interpretation of measurement data or status.

#### Version 2

[See schema](/schemas/v2/message_schema.md)

##### Example

```json
{
   "content-spec":"urn:spec://eclipse.org/unide/machine-message#v2",
   "device": {
      "deviceID": "2ca5158b-8350-4592-bff9-755194497d4e"
   },
   "messages": [{
    "ts": "2002-05-30T09:30:10.123+02:00",       
    "code": "190ABT"
   }]
}
```

### Version 3

[See schema](/schemas/v3/message_schema.md)

Example

Process Message Payload

Version 2
