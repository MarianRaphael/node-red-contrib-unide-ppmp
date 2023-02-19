module.exports = function (RED) {
  const Ajv = require("ajv");
  const ajv = new Ajv();
  const fs = require("fs");

  function ppmpValidation(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.version = config.version;
    node.type = config.type;

    if (node.version == "3" && node.type == "process") {
      var schema = JSON.parse(
        fs.readFileSync("/schemas/v3/process_schema.json", { encoding: "utf8" })
      );
    }
    if (node.version == "3" && node.type == "measurement") {
      var schema = JSON.parse(
        fs.readFileSync("/schemas/v3/measurement_schema.json", {
          encoding: "utf8",
        })
      );
    }
    if (node.version == "3" && node.type == "message") {
      var schema = JSON.parse(
        fs.readFileSync("/schemas/v3/message_schema.json", { encoding: "utf8" })
      );
    }
    if (node.version == "2" && node.type == "process") {
      var schema = JSON.parse(
        fs.readFileSync("/schemas/v2/process_schema.json", { encoding: "utf8" })
      );
    }
    if (node.version == "2" && node.type == "measurement") {
      var schema = JSON.parse(
        fs.readFileSync("/schemas/v2/measurement_schema.json", {
          encoding: "utf8",
        })
      );
    }
    if (node.version == "2" && node.type == "message") {
      var schema = JSON.parse(
        fs.readFileSync("/schemas/v2/message_schema.json", { encoding: "utf8" })
      );
    }

    var validate = ajv.compile(schema);

    // Handle incoming messages
    node.on("input", function (msg) {
      try {
        var data = JSON.parse(msg.payload);
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
