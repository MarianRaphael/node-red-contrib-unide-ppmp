```json
{
    "type": "object",
    "properties": {
        "content-spec": {
            "type": "string",
            "default": "urn:spec://eclipse.org/unide/measurement-message#v2",
            "description": "Defines what the format version is"
        },
        "device": {
            "type": "object",
            "description": "Contains information about the device",
            "properties": {
                "deviceID": {
                    "type": "string",
                    "description": "The unique ID of the device. As this is used to identify a device independently from time or location the ID itself must be stable and unique. The recommendation is to use a universally unique identifier (UUID).",
                    "maxLength": 36
                },
                "metaData": {
                    "type": "object",
                    "patternProperties": {
                        ".*": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": false,
                    "description": "Additional key-value pairs in a JSON structure format. Key and value must be strings"
                },
                "operationalStatus": {
                    "type": "string",
                    "description": "The operationalStatus describes the status of a device. It is a string matching a definition in the Production Performance Manager"
                }
            },
            "additionalProperties": false,
            "required": [
                "deviceID"
            ]
        },
        "part": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The code is an addendum to the result which allows to pass information in the case the result was NOK. The value often stems from the integrated system e.g. a PLC code",
                    "maxLength": 36
                },
                "metaData": {
                    "type": "object",
                    "patternProperties": {
                        ".*": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": false,
                    "description": "Additional key-value pairs in a JSON structure format. Key and value must be strings"
                },
                "partID": {
                    "type": "string",
                    "description": "Identifies a part. This ID comes from a 3rd party system and thus we have no guarantees if this is unique or not.",
                    "maxLength": 256
                },
                "partTypeID": {
                    "type": "string",
                    "description": "Identifies a part type",
                    "maxLength": 256
                },
                "result": {
                    "type": "string",
                    "enum": [
                        "OK",
                        "NOK",
                        "UNKNOWN"
                    ],
                    "description": "Information if the result was ok or not. This is only required if part information should be saved.",
                    "default": "UNKNOWN"
                }
            },
            "additionalProperties": false,
            "required": []
        },
        "measurements": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "The code is an addendum to the result which allows to pass information in the case the result was NOK. The value often stems from the integrated system e.g. a PLC code",
                        "maxLength": 36
                    },
                    "limits": {
                        "type": "object",
                        "description": "Provides information about limits for data provided in the series element.",
                        "patternProperties": {
                            "^[^$]+": {
                                "type": "object",
                                "description": "The key shall be the name of a measurement point (element of series element). The value is a structure of different upper/lower limits.",
                                "properties": {
                                    "lowerError": {
                                        "type": "number",
                                        "description": "Indicates an error if this limit is underrun"
                                    },
                                    "lowerWarn": {
                                        "type": "number",
                                        "description": "Indicates a warning if this limit is underrun"
                                    },
                                    "target": {
                                        "type": "number",
                                        "description": "Indicates the intented target value of the measurement"
                                    },
                                    "upperError": {
                                        "type": "number",
                                        "description": "Indicates an error if this limit is exceeded"
                                    },
                                    "upperWarn": {
                                        "type": "number",
                                        "description": "Indicates a warning if this limit is exceeded"
                                    }
                                }
                            }
                        },
                        "additionalProperties": false,
                        "required": []
                    },
                    "result": {
                        "type": "string",
                        "enum": [
                            "OK",
                            "NOK",
                            "UNKNOWN"
                        ],
                        "description": "Information if the result was ok or not. This is only required if part information should be saved.",
                        "default": "UNKNOWN"
                    },
                    "series": {
                        "type": "object",
                        "description": "The series data collected for the measurements. Every entry matches a Measurement Point of the Device Type. In the case of a time series, one column contains the time offsets.",
                        "properties": {
                            "$_time": {
                                "type": "array",
                                "description": "The time offset in milliseconds (positive values in ascending order starting with 0) to the 'ts' field of the measurement",
                                "items": {
                                    "type": "integer"
                                }
                            }
                        },
                        "patternProperties": {
                            "^[^$]+": {
                                "type": "array",
                                "items": {
                                    "type": "number"
                                }
                            }
                        },
                        "required": [
                            "$_time"
                        ],
                        "minProperties": 2,
                        "additionalProperties": false
                    },
                    "ts": {
                        "format": "date-time",
                        "type": "string",
                        "description": "Start time of the the data measurment in  ISO 8601 format"
                    }
                },
                "required": [
                    "ts",
                    "series"
                ]
            }
        }
    },
    "additionalProperties": false,
    "required": [
        "content-spec",
        "device",
        "measurements"
    ]
}
```
