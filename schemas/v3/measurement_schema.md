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
		"part": {
			"$ref": "definitions.json#/definitions/part"
		},
		"measurements": {
			"allOf": [
				{
					"$ref": "definitions.json#/definitions/measurements"
				},
				{
					"items": {
						"properties": {
							"series": {
								"required": ["time"]
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
		"measurements"
	]
}
```‚