module.exports = function(RED) {
  function ppmpMessage(config) {
      RED.nodes.createNode(this,config);
      var node = this;
      node.version = config.version;
      node.deviceId = config.deviceId;
      var time = new Date().toISOString();
      if (node.version == "2") {
        node.on('input', function(msg) {
          var output = {
            "content-spec": "urn:spec://eclipse.org/unide/machine-message#v2",
            "device": {
              "deviceID": node.deviceId
            },
            "messages": [
              {
                "ts": time,
                "code": msg.payload
              }
            ]
          };
          msg.payload = output;
          node.send(msg);
        });
      } if (node.version == "3") {
        node.on('input', function(msg) {
          var output = {
            'content-spec': 'urn:spec://eclipse.org/unide/machine-message#v3',
            "device":         {
              "id": node.deviceId
            },
            "messages": [{
              "ts":   time,
              "code": msg.payload
            }]
          };
          msg.payload = output;
          node.send(msg);
        });
      }
    }
  RED.nodes.registerType("PPMP-Message",ppmpMessage);
}