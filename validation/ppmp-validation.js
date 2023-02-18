module.exports = function (RED) {
  function PPMPValidation(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.version = config.version;
    node.type = config.type;
    var Ajv = require("ajv");
    var ajv = new Ajv();

    if (node.version == "3" && node.type == "process") {
      var schema = "/schemas/v3/process_schema.json";
    }
    if (node.version == "3" && node.type == "measurement") {
      var schema = "/schemas/v3/measurement_schema.json";
    }
    if (node.version == "3" && node.type == "message") {
      var schema = "/schemas/v3/message_schema.json";
    }
    if (node.version == "2" && node.type == "process") {
      var schema = "/schemas/v2/process_schema.json";
    }
    if (node.version == "2" && node.type == "measurement") {
      var schema = "/schemas/v2/measurement_schema.json";
    }
    if (node.version == "2" && node.type == "message") {
      var schema = "/schemas/v2/message_schema.json";
    }

    node.on("input", function (msg) {
      try {
        var data = JSON.parse(msg.payload);
        var validate = ajv.compile(schema);
        var valid = validate(data);

        if (valid) {
          node.status({ fill: "green", shape: "dot", text: "Valid JSON" });
          node.send([{ payload: data }, null]);
          node.debug("JSON is valid");
        } else {
          node.status({ fill: "red", shape: "dot", text: "Invalid JSON" });
          var errors = validate.errors
            .map(function (e) {
              return e.message;
            })
            .join(", ");
          node.send([null, { payload: errors }]);
          node.error("JSON is invalid: " + errors);
        }
      } catch (error) {
        node.status({ fill: "red", shape: "dot", text: "Invalid JSON" });
        node.error("JSON parse error: " + error.message);
        node.send([null, { payload: "JSON parse error: " + error.message }]);
      }
    });
  }
  RED.nodes.registerType("PPMP-Validation", PPMPValidation);
};
