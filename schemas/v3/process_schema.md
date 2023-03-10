```json
{
	"type": "object",
	"properties": {
		"content-spec": {
			"type": "string",
			"default": "urn:spec://eclipse.org/unide/process-message#v3",
			"description": "Defines what the format version is"
		},
		"device": {
			"$ref": "definitions.json#/definitions/device"
		},
		"part": {
			"$ref": "definitions.json#/definitions/part"
		},
		"process": {
			"type": "object",
			"description": "Contains information about the process. If the process JSON object is set, then all information in measurements are process phases",
			"properties": {
				"externalId": {
					"type": "string",
					"description": "The process id identifies the process as part of long living process. The process id can be used to connect multiple processes in a manufacturing chain. The id has to be set and tracked by the different devices in the chain.",
					"maxLength": 36
				},
				"program": {
					"type": "object",
					"description": "Contains information about the program that was used in the process.",
					"properties": {
						"id": {
							"type": "string",
							"description": "The program identifier",
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
						},
						"additionalData": {
							"type": "object"
						}
					},
					"required": [
						"id"
					]
				},
				"result": {
					"$ref": "definitions.json#/definitions/result"
				},
				"shutoffPhase": {
					"type": "string",
					"description": "The id of the phase that led to stop the process. The shutOffPhase is the phase of the process in which either pre-defined parameters are met to successfully finish the process or an error that stopped the process. That is not necessarily the last phase. The shutOffPhase should be sent when the last process phase is sent."
				},
				"ts": {
					"type": "string",
					"format": "date-time",
					"description": "Start time of the process"
				},
				"additionalData": {
					"type": "object"
				}
			},
			"required": [
				"ts"
			]
		},
		"measurements": {
			"allOf": [
				{
					"$ref": "definitions.json#/definitions/measurements"
				},
				{
					"type": "array",
					"items": {
						"type": "object",
						"properties": {
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
							"specialValues": {
								"type": "array",
								"items": {
									"type": "object",
									"description": "Provides information about special or interesting values during the process phase.",
									"properties": {
										"time": {
											"type": "number",
											"description": "The time offset in milliseconds to the 'ts' field of the measurement"
										},
										"name": {
											"type": "string",
											"description": "Indicates the type of the specialValue (e.g. 'shutoff', endanzug', 'turningPoint' etc.)"
										},
										"value": {
											"type": "object",
											"description": "Contains the actual (multidimensional) value of interest. Similarly to series, every entry matches a Measurement Point of the device",
											"patternProperties": {
												"^[^$]+": {
													"type": ["boolean", "number", "string"],
													"description": "The type of this measurement series is dependendant on the context.type. It defaults to number"
												}
											},
											"minProperties": 1
										}
									},
									"required": [
										"value"
									]
								}
							}
						}
					}
				}
			]
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