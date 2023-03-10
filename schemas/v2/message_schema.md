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
		"messages": {
			"minItems": 1,
			"type": "array",
			"items": {
				"type": "object",
				"description": "Collection of messages",
				"properties": {
					"code": {
						"type": "string",
						"description": "Code identifying the problem described in the message. The value often stems from the machine e.g. a PLC code. Is similar to code in measurement interface.",
						"maxLength": 36
					},
					"description": {
						"type": "string",
						"description": "The description is used to describe the purpose of the message, e.g. the problem",
						"maxLength": 2000
					},
					"hint": {
						"type": "string",
						"description": "In case a problem is reported, the hint can be used to point out a possible solution",
						"maxLength": 2000
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
					"origin": {
						"type": "string",
						"description": "The origin of the message if not the device identified by deviceID in the header element. Could be used to identify a subsystem or a particular sensor/part of the device where the message actually relates to."
					},
					"severity": {
						"type": "string",
						"description": "Severity of the message",
						"enum": [
							"HIGH",
							"MEDIUM",
							"LOW",
							"UNKNOWN"
						],
						"default": "UNKNOWN"
					},
					"title": {
						"type": "string",
						"description": "Title of the message. If title not set the code will be stored as fallback",
						"maxLength": 1000
					},
					"ts": {
						"format": "date-time",
						"type": "string",
						"description": "Start time of the the data measurment in  ISO 8601 format"
					},
					"type": {
						"type": "string",
						"description": "The type of message. Default is DEVICE but can be set to TECHNICAL_INFO indicating a problem with the integration of the actual device. Allowed values: DEVICE, TECHNICAL_INFO",
						"enum": [
							"DEVICE",
							"TECHNICAL_INFO"
						],
						"default": "DEVICE"
					}
				},
				"required": [
					"ts",
					"code"
				]
			}
		}
	},
	"additionalProperties": false,
	"required": [
		"content-spec",
		"device",
		"messages"
	]
}
```