module.exports = function(RED) {
  function ppmpProcess(config) {
      RED.nodes.createNode(this,config);
      var node = this;
      node.version = config.version;
      node.deviceId = config.deviceId;
      var time = new Date().toISOString();
      if (node.version == "2") {
        node.on('input', function(msg) {
          var series = {};
          Object.entries(msg.payload).forEach(([name, number]) => {
            series[name] = number;
          });
          var output = {
            "content-spec": "urn:spec://eclipse.org/unide/process-message#v2",
            "device": {
              "deviceID": node.deviceId
            },
            "process": {
              ts: time
            },
            "measurements": [{
              "ts": time,
              "series": series
            }]
          };
          msg.payload = output;
          node.send(msg);
        });
      } if (node.version == "3") {
        node.on('input', function(msg) {
          var series = {};
          Object.entries(msg.payload).forEach(([name, number]) => {
            series[name] = number;
          });
          var output = {
            'content-spec': 'urn:spec://eclipse.org/unide/process-message#v3',
            "device":         {
              "id": node.deviceId
            },
            "process": {
              ts: time
            },
            "measurements": [{
              "ts": time,
              "series": series
            }]
          };
          msg.payload = output;
          node.send(msg);
        });
      }
    }
  RED.nodes.registerType("PPMP-Process",ppmpProcess);
}