```json
{
	"definitions": {
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
		"limit": {
			"description": "Provides information about limits for data provided in the series element. The limits is an JSON object where the key is the name of a Measurement Point (see also series element) and the value is a structure of upper/lower limits",
			"type": "object",
			"patternProperties": {
				"^[^$]+": {
					"oneOf": [{
						"type": "object",
						"description": "A constant limit for all corresponding measurements",
						"properties": {
							"lowerError": {
								"description": "Indicates an error if this limit is underrun",
								"type": "number"
							},
							"lowerWarn": {
								"description": "Indicates a warning if this limit is underrun",
								"type": "number"
							},
							"target": {
								"description": "Indicates the intented target value of the measurement",
								"type": "number"
							},
							"upperError": {
								"description": "Indicates an error if this limit is exceeded",
								"type": "number"
							},
							"upperWarn": {
								"description": "Indicates a warning if this limit is exceeded",
								"type": "number"
							}
						},
						"additionalProperties": false
					}, {
						"type": "object",
						"description": "An array of limit values. The items of the array correspond to the respective measurements at the same position.",
						"properties": {
							"lowerError": {
								"description": "Indicates an error if these limits is underrun. The values correspond to the respective measurements in the given order.",
								"type": "array",
								"items": {
									"type": "number"
								}
							},
							"lowerWarn": {
								"description": "Indicates a warning if these limits is underrun. The values correspond to the respective measurements in the given order.",
								"type": "array",
								"items": {
									"type": "number"
								}
							},
							"target": {
								"description": "Indicates the intented target values. The values correspond to the respective measurements in the given order.",
								"type": "array",
								"items": {
									"type": "number"
								}
							},
							"upperError": {
								"description": "Indicates an error if these limits is exceeded. The values correspond to the respective measurements in the given order.",
								"type": "array",
								"items": {
									"type": "number"
								}
							},
							"upperWarn": {
								"description": "Indicates a warning if these limits is exceeded. The values correspond to the respective measurements in the given order.",
								"type": "array",
								"items": {
									"type": "number"
								}
							}
						},
						"additionalProperties": false
					}]
				}
			}
		}
	},
	"type": "object",
	"properties": {
		"content-spec": {
			"type": "string",
			"default": "urn:spec://eclipse.org/unide/process-message#v2",
			"description": "Defines what the format version is"
		},
		"device": { "$ref": "#/definitions/device" },
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
				},
				"type": {
					"type": "string",
					"enum": [
						"SINGLE",
						"BATCH"
					],
					"description": "Describes the type of the part. Type SINGLE means a single item is processed. Type BATCH means multiple items of the same type are processed.",
					"default": "SINGLE"
				}
			},
			"required": [],
			"additionalProperties": false
		},
		"process": {
			"type": "object",
			"description": "Contains information about the process. If the process JSON object is set, then all information in measurements are process phases",
			"properties": {
				"externalProcessId": {
					"type": "string",
					"description": "The process Id identifies the process as part of long living process. The process Id can be used to connect multiple processes in a manufacturing chain. The Id has to be set and tracked by the different devices in the chain.",
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
				"program": {
					"type": "object",
					"description": "Contains information about the program that was used in the process.",
					"properties": {
						"id": {
							"type": "string",
							"description": "The ID of the program",
							"maxLength": 36
						},
						"lastChangedDate": {
							"type": "string",
							"format": "date-time",
							"description": "The date when the program was last changed"
						},
						"name": {
							"type": "string",
							"description": "The name of the program",
							"maxLength": 256
						}
					},
					"additionalProperties": false,
					"required": [
						"id"
					]
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
				"shutoffPhase": {
					"type": "string",
					"description": "The ID of the phase that led to stop the process. The shutOffPhase is the phase of the process in which either pre-defined parameters are met to successfully finish the process or an error that stopped the process. That is not necessarily the last phase. The shutOffPhase should be sent when the last process phase is sent."
				},
				"shutoffValues": {
					"type": "object",
					"description": "The shutoff values contain the values of the process that stopped the process. The shutoffValues is a JSON object where the key is the name of a Measurement Point (see also series element) and the value is a structure of different upper/lower limits and the actual value as described below.",
					"patternProperties": {
						"^[^$]+": {
							"type": "object",
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
								"ts": {
									"type": "string",
									"format": "date-time",
									"description": "Time of the measured value"
								},
								"upperWarn": {
									"type": "number",
									"description": "Indicates a warning if this limit is exceeded"
								},
								"upperError": {
									"type": "number",
									"description": "Indicates an error if this limit is exceeded"
								},
								"value": {
									"type": "number",
									"description": "The final value of the process"
								}
							},
							"additionalProperties": false,
							"required": [
								"value"
							]
						}
					}
				},
				"ts": {
					"type": "string",
					"format": "date-time",
					"description": "Start time of the process"
				}
			},
			"additionalProperties": false,
			"required": [
				"ts"
			]
		},
		"measurements": {
			"type": "array",
			"items": {
				"type": "object",
				"description": "Contains the different phases of the process. Each phase represents an execution step in the process and contains information about that specific execution step. All phases should be sorted by the timestamp of the phase.",
				"properties": {
					"code": {
						"type": "string",
						"description": "The code is an addendum to the result which allows to pass information in the case the result was NOK. The value often stems from the integrated system e.g. a PLC code",
						"maxLength": 36
					},
					"limits": {
						"$ref": "#/definitions/limit"
					},
					"name": {
						"type": "string",
						"description": "The name of the process phase",
						"maxLength": 256
					},
					"phase": {
						"type": "string",
						"description": "The id of the process phase",
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
					},
					"specialValues": {
						"type": "array",
						"items": {
							"type": "object",
							"description": "Provides information about special or interesting values during the process phase.",
							"properties": {
								"$_time": {
									"type": "integer",
									"description": "The time offset in milliseconds to the 'ts' field of the measurement"
								},
								"name": {
									"type": "string",
									"description": "indicates the type of the specialValue (e.g. 'endanzug', 'turningPoint' etc.)"
								},
								"value": {
									"type": "object",
									"description": "Contains the actual (multidimensional) value of interest. Similarly to series, every entry matches a Measurement Point of the device",
									"patternProperties": {
										"^[^$]+": {
											"type": "number"
										}
									},
									"minProperties": 1
								}
							},
							"additionalProperties": false,
							"required": [
								"value"
							]
						}
					},
					"series": {
						"type": "object",
						"description": "The series data collected for the measurements. Every entry matches a Measurement Point of the device. In the case of a time series, one column contains the time offset in milliseconds (positive values in ascending order starting with 0). In this case the value is the keyword $_time. The maximum size for the measurement value is 10 positions before the decimal point.",
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
						"additionalProperties": false
					},
					"ts": {
						"type": "string",
						"format": "date-time",
						"description": "Start time of the the data measurment in  ISO 8601 format"
					}
				},
				"additionalProperties": false,
				"required": [
					"ts",
					"series"
				]
			}
		}
	},
	"required": [
		"content-spec",
		"device",
		"process",
		"measurements"
	]
}
```