```json
{
	"type": "object",
	"properties": {
		"content-spec": {
			"type": "string",
			"default": "urn:spec://eclipse.org/unide/machine-message#v3",
			"description": "Defines what the format version is"
		},
		"device": {
			"$ref": "definitions.json#/definitions/device"
		},
		"messages": {
			"minItems": 1,
			"type": "array",
			"items": {
				"type": "object",
				"description": "Collection of messages",
				"properties": {
					"code": {
						"$ref": "definitions.json#/definitions/code"
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
					"origin": {
						"type": "string",
						"description": "The origin of the message if not the device identified by deviceID in the header element. Could be used to identify a subsystem or a particular sensor/part of the device where the message actually relates to."
					},
					"severity": {
						"type": "string",
						"description": "Severity of the message. It complements type for describing urgency and relevance of a message",
						"enum": [
							"HIGH",
							"MEDIUM",
							"LOW",
							"UNKNOWN"
						],
						"default": "UNKNOWN"
					},
					"source": {
						"type": "string",
						"description": "The type of message. Default is DEVICE but can be set to TECHNICAL_INFO indicating a problem with the integration of the actual device. Allowed values: DEVICE, TECHNICAL_INFO",
						"enum": [
							"DEVICE",
							"TECHNICAL_INFO"
						],
						"default": "DEVICE"
					},
					"state": {
						"type": "string",
						"enum": [
							"NEW",
							"ENDED"
						],
						"description": "Determines the lifecycle state of the message"
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
						"description": "Describes the debug level of the message. It complements severity for describing urgency and relevance of a message",
						"enum": [
							"INFO",
							"WARNING",
							"ERROR",
							"UNKNOWN"
						],
						"default": "UNKNOWN"
					},
					"additionalData": {
						"type": "object"
					}
				},
				"required": [
					"ts",
					"code"
				]
			}
		}
	},
	"required": [
		"content-spec",
		"device",
		"messages"
	]
}
```