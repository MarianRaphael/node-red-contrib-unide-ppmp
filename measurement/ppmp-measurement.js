module.exports = function(RED) {
  function ppmpMeasurement(config) {
      RED.nodes.createNode(this,config);
      var node = this;
      node.version = config.version;
      node.deviceId = config.deviceId;
      var time = new Date().toISOString();
      if (node.version == "2") {
        node.on('input', function(msg) {
          var series = { "$_time" : [0] };
          Object.entries(msg.payload).forEach(([name, number]) => {
            series[name] = number;
          });
          var output = {
            "content-spec": "urn:spec://eclipse.org/unide/measurement-message#v2",
            "device": {
              "deviceID": node.deviceId
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
          var series = { "time": [0] };
          Object.entries(msg.payload).forEach(([name, number]) => {
            series[name] = number;
          });
          var output = {
            'content-spec': 'urn:spec://eclipse.org/unide/measurement-message#v3',
            "device":         {
              "id": node.deviceId
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
  RED.nodes.registerType("PPMP-Measurement",ppmpMeasurement);
}