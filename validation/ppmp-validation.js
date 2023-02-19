module.exports = function (RED) {
  const AJV = require('ajv').default;
	const addFormats = require('ajv-formats').default;
  const ajv = new AJV({strict: false});
  addFormats(ajv);
  const path = require("path");
  const fs = require("fs");

  function ppmpValidation(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.version = config.version;
    node.class = config.class;

    var resourcePath = path.join(RED.settings.userDir, "node_modules", "node-red-contrib-unide-ppmp", "schemas");

    if (node.version == "3" && node.class == "process") {
      var schema = JSON.parse(fs.readFileSync(path.join(resourcePath, "v3", "process_schema.json"), { encoding: "utf8" }));
    } else if (node.version == "3" && node.class == "measurement") {
      var schema = JSON.parse(fs.readFileSync(path.join(resourcePath, "v3", "measurement_schema.json"), { encoding: "utf8" }));
    } else if (node.version == "3" && node.class == "message") {
      var schema = JSON.parse(fs.readFileSync(path.join(resourcePath, "v3", "message_schema.json"), { encoding: "utf8" }));
    } else if (node.version == "2" && node.class == "process") {
      var schema = JSON.parse(fs.readFileSync(path.join(resourcePath, "v2", "process_schema.json"), { encoding: "utf8" }));
    } else if (node.version == "2" && node.class == "measurement") {
      var schema = JSON.parse(fs.readFileSync(path.join(resourcePath, "v2", "measurement_schema.json"), { encoding: "utf8" }));
    } else if (node.version == "2" && node.class == "message") {
      var schema = JSON.parse(fs.readFileSync(path.join(resourcePath, "v2", "message_schema.json"), { encoding: "utf8" }));
    } else {
      // Handle unsupported version or class
      node.error("Unsupported PPMP version or class");
      return;
    }

    var validate = ajv.compile(schema);

    // Handle incoming messages
    node.on("input", function (msg) {
      try {
        var data = msg.payload;
        var valid = validate(data);

        if (valid) {
          node.status({ fill: "green", shape: "dot", text: "Valid PPMP" });
          node.send([{ payload: data }, null]);
          node.debug("PPMP is valid");
        } else {
          node.status({ fill: "red", shape: "dot", text: "Invalid PPMP" });
          var errors = validate.errors
            .map(function (e) {
              return e.message;
            })
            .join(", ");
          //node.send([null, { payload: errors }]);
          node.error("PPMP is invalid: " + errors);
        }
      } catch (error) {
        node.status({ fill: "red", shape: "dot", text: "Invalid PPMP" });
        node.error("PPMP parse error: " + error.message);
        //node.send([null, { payload: "JSON parse error: " + error.message }]);
      }
    });
  }

  RED.nodes.registerType("PPMP-Validation", ppmpValidation);
};
