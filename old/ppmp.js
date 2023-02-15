module.exports = function(RED) {
	"use strict";
	var mqtt = require("mqtt"); //MIT
	var isUtf8 = require('is-utf8'); //MIT
	var url = require('url'); //MIT
	var validate = require('jsonschema').validate; //MIT
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; //MIT
	var fs = require("fs"); //keine Lizenz
	
	var MACHINE_CONTENT_SPEC = "urn:spec://eclipse.org/unide/machine-message#v2";
	var MEASUREMENT_CONTENT_SPEC = "urn:spec://eclipse.org/unide/measurement-message#v2";
	var PROCESS_CONTENT_SPEC = "urn:spec://eclipse.org/unide/process-message#v2";
	var ALL_CONTENT_SPEC = "urn:spec://eclipse.org/unide/machine-message#v2, urn:spec://eclipse.org/unide/measurement-message#v2, urn:spec://eclipse.org/unide/process-message#v2";
	
	var ppmptypeMap = new Map();
	ppmptypeMap.set(MACHINE_CONTENT_SPEC, "message_schema");
	ppmptypeMap.set(MEASUREMENT_CONTENT_SPEC, "measurement_schema");
	ppmptypeMap.set(PROCESS_CONTENT_SPEC, "process_schema");
	
	function createMessage(node, topic, packet, response, jsonPayload) {
		var msg = "";
		if (response.errors.length == 0) {
			console.log(node.mqtt);
			if (!node.mqtt) {
				msg = jsonPayload;
			} else if (jsonPayload["content-spec"] == MACHINE_CONTENT_SPEC) {
				msg = {
					content_spec: jsonPayload["content-spec"],
					device: jsonPayload["device"],
					messages: jsonPayload["messages"],
					topic: topic,
					payload: jsonPayload,
					qos: packet.qos,
					retain: packet.retain
				};
			} else if (jsonPayload["content-spec"] == MEASUREMENT_CONTENT_SPEC) {
				msg = {
					content_spec: jsonPayload["content-spec"],
					device: jsonPayload["device"],
					measurements: jsonPayload["measurements"],
					part: jsonPayload["part"],
					topic: topic,
					payload: jsonPayload,
					qos: packet.qos,
					retain: packet.retain
				};
			} else if (jsonPayload["content-spec"] == PROCESS_CONTENT_SPEC) {
				msg = {
					content_spec: jsonPayload["content-spec"],
					device: jsonPayload["device"],
					measurements: jsonPayload["measurements"],
					part: jsonPayload["part"],
					process: jsonPayload["process"],
					topic: topic,
					payload: jsonPayload,
					qos: packet.qos,
					retain: packet.retain
				};
			}
			if (node.mqtt && ((node.brokerConn.broker === "localhost") || (node.brokerConn.broker === "127.0.0.1"))) {
				msg._topic = topic;
			}
		} else {
			msg = {
				topic: topic,
				payload: response.errors,
				qos: packet.qos,
				retain: packet.retain
			};
		}
		return msg;
	}
	
	function subscribe(node, topic, payload, packet, type) {
		if (isUtf8(payload)) {
			payload = payload.toString();
		}
		var jsonPayload = JSON.parse(payload);
		if (checkforexistingcontentspec(jsonPayload)) {
			var msg = "";
			validateInput(type, jsonPayload, function(response) {
				node.send(createMessage(node, topic, packet, response, jsonPayload));
			});
		} else {
			msg = {
				topic: topic,
				payload: "Payload doesnt contain a content-spec",
				qos: packet.qos,
				retain: packet.retain
			};
			node.send(msg);
		}
	}
	
	function initalizeInNode(inNode, config, type) {
		RED.nodes.createNode(inNode, config);
		var node = inNode;
		inNode.topic = config.topic;
		inNode.qos = parseInt(config.qos);
		inNode.mqtt = config.mqtt;
		if (isNaN(inNode.qos) || inNode.qos < 0 || inNode.qos > 2) {
			inNode.qos = 2;
		}
		inNode.broker = config.broker;
		inNode.brokerConn = RED.nodes.getNode(inNode.broker);
		if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(inNode.topic)) {
			return inNode.warn(RED._("mqtt.errors.invalid-topic"));
		}
		if (inNode.brokerConn) {
			inNode.status({
				fill: "red",
				shape: "ring",
				text: "node-red:common.status.disconnected"
			});
			if (inNode.topic) {
				node.brokerConn.register(inNode);
				inNode.brokerConn.subscribe(inNode.topic, inNode.qos, function(topic, payload, packet) {
					subscribe(inNode, topic, payload, packet, type);
				}, inNode.id);
				if (inNode.brokerConn.connected) {
					node.status({
						fill: "green",
						shape: "dot",
						text: "node-red:common.status.connected"
					});
				}
			} else {
				inNode.error(RED._("ppmp-mqtt.errors.not-defined"));
			}
			inNode.on('close', function(done) {
				if (node.brokerConn) {
					node.brokerConn.unsubscribe(node.topic, node.id);
					node.brokerConn.deregister(node, done);
				}
			});
		} else {
			inNode.error(RED._("ppmp-mqtt.errors.missing-config"));
		}
		
	}
	
	function matchTopic(ts, t) {
		if (ts == "#") {
			return true;
		}
		/* The following allows shared subscriptions (as in v5)
		   http://docs.oasis-open.org/mqtt/mqtt/v5.0/cs02/mqtt-v5.0-cs02.html#_Toc514345522
		   
		   4.8.2 describes shares like:
		   $share/{ShareName}/{filter}
		   $share is a literal string that marks the Topic Filter as being a Shared Subscription Topic Filter.
		   {ShareName} is a character string that does not include "/", "+" or "#"
		   {filter} The remainder of the string has the same syntax and semantics as a Topic Filter in a non-shared subscription. Refer to section 4.7.
		*/
		else if (ts.startsWith("$share")) {
			ts = ts.replace(/^\$share\/[^#+/]+\/(.*)/g, "$1");
		}
		var re = new RegExp("^" + ts.replace(/([\[\]\?\(\)\\\\$\^\*\.|])/g, "\\$1").replace(/\+/g, "[^/]+").replace(/\/#$/, "(\/.*)?") + "$");
		return re.test(t);
	}
	
	function getType(type) {
		return (ppmptypeMap.has(type)) ? ppmptypeMap.get(type) : "The payload type is not valid";
	}
	
	function loadJSON(file, callback) {
		fs.readFile(file, {
			encoding: 'utf-8'
		}, function(err, fileContent) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log('Could not find file "' + err.path + '". Hint: File path is relative to "' + process.env.PWD + '"');
					callback(JSON.parse('{"errors":[{"message":"test"}]}'));
				} else {
					console.log(err);
					callback(JSON.parse('{"errors":[{"message":"' + err + '"}]}'));
				}
			} else {
				callback(fileContent);
			}
		});
	}
	
	function validateAgainstSpecificSchema(type, jsonObject, callback) {
		loadJSON('.node-red/node_modules/node-red-contrib-ppmp/schemas/' + type + '.json', function(text) {
			console.log(text)
			var schema = JSON.parse(text);
			callback(validate(jsonObject, schema))
		});
	}
	
	function validateInput(content_spec, input, callback) {
		console.log(content_spec + " == " + input["content-spec"]);
		if (!content_spec.includes(input["content-spec"])) {
			callback(JSON.parse('{"errors":[{"message":"wrong content type"}]}'));
			return;
		}
		var type = getType(input["content-spec"]);
		if (type.includes("not valid")) {
			callback(JSON.parse('{"errors":[{"message":"type is not valid"}]}'));
			return;
		}
		validateAgainstSpecificSchema(type, input, callback);
	}
	
	function checkforexistingcontentspec(input) {
		return (input["content-spec"]) ? true : false;
	}
	
	function PPMPMQTTBrokerNode(n) {
		RED.nodes.createNode(this, n);
		
		// Configuration options passed by Node Red
		this.broker = n.broker;
		this.port = n.port;
		this.clientid = n.clientid;
		this.usetls = n.usetls;
		this.usews = n.usews;
		this.verifyservercert = n.verifyservercert;
		this.compatmode = n.compatmode;
		this.keepalive = n.keepalive;
		this.cleansession = n.cleansession;
		
		// Config node state
		this.brokerurl = "";
		this.connected = false;
		this.connecting = false;
		this.closing = false;
		this.options = {};
		this.queue = [];
		this.subscriptions = {};
		
		if (n.birthTopic) {
			this.birthMessage = {
				topic: n.birthTopic,
				payload: n.birthPayload || "",
				qos: Number(n.birthQos || 0),
				retain: n.birthRetain == "true" || n.birthRetain === true
			};
		}
		
		if (n.closeTopic) {
			this.closeMessage = {
				topic: n.closeTopic,
				payload: n.closePayload || "",
				qos: Number(n.closeQos || 0),
				retain: n.closeRetain == "true" || n.closeRetain === true
			};
		}
		
		if (this.credentials) {
			this.username = this.credentials.user;
			this.password = this.credentials.password;
		}
		
		// If the config node is missing certain options (it was probably deployed prior to an update to the node code),
		// select/generate sensible options for the new fields
		if (typeof this.usetls === 'undefined') {
			this.usetls = false;
		}
		if (typeof this.usews === 'undefined') {
			this.usews = false;
		}
		if (typeof this.compatmode === 'undefined') {
			this.compatmode = true;
		}
		if (typeof this.verifyservercert === 'undefined') {
			this.verifyservercert = false;
		}
		if (typeof this.keepalive === 'undefined') {
			this.keepalive = 60;
		} else if (typeof this.keepalive === 'string') {
			this.keepalive = Number(this.keepalive);
		}
		if (typeof this.cleansession === 'undefined') {
			this.cleansession = true;
		}
		var prox;
		if (process.env.http_proxy != null) {
			prox = process.env.http_proxy;
		}
		if (process.env.HTTP_PROXY != null) {
			prox = process.env.HTTP_PROXY;
		}
		
		// Create the URL to pass in to the MQTT.js library
		if (this.brokerurl === "") {
			// if the broker may be ws:// or wss:// or even tcp://
			if (this.broker.indexOf("://") > -1) {
				this.brokerurl = this.broker;
				// Only for ws or wss, check if proxy env var for additional configuration
				if (this.brokerurl.indexOf("wss://") > -1 || this.brokerurl.indexOf("ws://") > -1)
					// check if proxy is set in env
					if (prox) {
						var parsedUrl = url.parse(this.brokerurl);
						var proxyOpts = url.parse(prox);
						// true for wss
						proxyOpts.secureEndpoint = parsedUrl.protocol ? parsedUrl.protocol === 'wss:' : true;
						// Set Agent for wsOption in MQTT
						var agent = new HttpsProxyAgent(proxyOpts);
						this.options.wsOptions = {
							agent: agent
						}
					}
			} else {
				// construct the std mqtt:// url
				if (this.usetls) {
					this.brokerurl = "mqtts://";
				} else {
					this.brokerurl = "mqtt://";
				}
				if (this.broker !== "") {
					this.brokerurl = this.brokerurl + this.broker + ":";
					// port now defaults to 1883 if unset.
					if (!this.port) {
						this.brokerurl = this.brokerurl + "1883";
					} else {
						this.brokerurl = this.brokerurl + this.port;
					}
				} else {
					this.brokerurl = this.brokerurl + "localhost:1883";
				}
			}
		}
		
		if (!this.cleansession && !this.clientid) {
			this.cleansession = true;
			this.warn(RED._("mqtt.errors.nonclean-missingclientid"));
		}
		
		// Build options for passing to the MQTT.js API
		this.options.clientId = this.clientid || 'mqtt_' + (1 + Math.random() * 4294967295).toString(16);
		this.options.username = this.username;
		this.options.password = this.password;
		this.options.keepalive = this.keepalive;
		this.options.clean = this.cleansession;
		this.options.reconnectPeriod = RED.settings.mqttReconnectTime || 5000;
		if (this.compatmode == "true" || this.compatmode === true) {
			this.options.protocolId = 'MQIsdp';
			this.options.protocolVersion = 3;
		}
		if (this.usetls && n.tls) {
			var tlsNode = RED.nodes.getNode(n.tls);
			if (tlsNode) {
				tlsNode.addTLSOptions(this.options);
			}
		}
		// console.log(this.brokerurl,this.options);
		
		// If there's no rejectUnauthorized already, then this could be an
		// old config where this option was provided on the broker node and
		// not the tls node
		if (typeof this.options.rejectUnauthorized === 'undefined') {
			this.options.rejectUnauthorized = (this.verifyservercert == "true" || this.verifyservercert === true);
		}
		
		if (n.willTopic) {
			this.options.will = {
				topic: n.willTopic,
				payload: n.willPayload || "",
				qos: Number(n.willQos || 0),
				retain: n.willRetain == "true" || n.willRetain === true
			};
		}
		
		// Define functions called by MQTT in and out nodes
		var node = this;
		this.users = {};
		
		this.register = function(mqttNode) {
			node.users[mqttNode.id] = mqttNode;
			if (Object.keys(node.users).length === 1) {
				node.connect();
			}
		};
		
		this.deregister = function(mqttNode, done) {
			delete node.users[mqttNode.id];
			if (node.closing) {
				return done();
			}
			if (Object.keys(node.users).length === 0) {
				if (node.client && node.client.connected) {
					return node.client.end(done);
				} else {
					node.client.end();
					return done();
				}
			}
			done();
		};
		
		this.connect = function() {
			if (!node.connected && !node.connecting) {
				node.connecting = true;
				try {
					node.client = mqtt.connect(node.brokerurl, node.options);
					node.client.setMaxListeners(0);
					// Register successful connect or reconnect handler
					node.client.on('connect', function() {
						node.connecting = false;
						node.connected = true;
						node.log(RED._("mqtt.state.connected", {
							broker: (node.clientid ? node.clientid + "@" : "") + node.brokerurl
						}));
						for (var id in node.users) {
							if (node.users.hasOwnProperty(id)) {
								node.users[id].status({
									fill: "green",
									shape: "dot",
									text: "node-red:common.status.connected"
								});
							}
						}
						// Remove any existing listeners before resubscribing to avoid duplicates in the event of a re-connection
						node.client.removeAllListeners('message');
						
						// Re-subscribe to stored topics
						for (var s in node.subscriptions) {
							if (node.subscriptions.hasOwnProperty(s)) {
								var topic = s;
								var qos = 0;
								for (var r in node.subscriptions[s]) {
									if (node.subscriptions[s].hasOwnProperty(r)) {
										qos = Math.max(qos, node.subscriptions[s][r].qos);
										node.client.on('message', node.subscriptions[s][r].handler);
									}
								}
								var options = {
									qos: qos
								};
								node.client.subscribe(topic, options);
							}
						}
						
						// Send any birth message
						if (node.birthMessage) {
							node.publish(node.birthMessage);
						}
					});
					node.client.on("reconnect", function() {
						for (var id in node.users) {
							if (node.users.hasOwnProperty(id)) {
								node.users[id].status({
									fill: "yellow",
									shape: "ring",
									text: "node-red:common.status.connecting"
								});
							}
						}
					})
					// Register disconnect handlers
					node.client.on('close', function() {
						if (node.connected) {
							node.connected = false;
							node.log(RED._("mqtt.state.disconnected", {
								broker: (node.clientid ? node.clientid + "@" : "") + node.brokerurl
							}));
							for (var id in node.users) {
								if (node.users.hasOwnProperty(id)) {
									node.users[id].status({
										fill: "red",
										shape: "ring",
										text: "node-red:common.status.disconnected"
									});
								}
							}
						} else if (node.connecting) {
							node.log(RED._("mqtt.state.connect-failed", {
								broker: (node.clientid ? node.clientid + "@" : "") + node.brokerurl
							}));
						}
					});
					
					// Register connect error handler
					// The client's own reconnect logic will take care of errors
					node.client.on('error', function(error) {});
				} catch (err) {
					console.log(err);
				}
			}
		};
		
		this.subscribe = function(topic, qos, callback, ref) {
			ref = ref || 0;
			node.subscriptions[topic] = node.subscriptions[topic] || {};
			var sub = {
				topic: topic,
				qos: qos,
				handler: function(mtopic, mpayload, mpacket) {
					if (matchTopic(topic, mtopic)) {
						callback(mtopic, mpayload, mpacket);
					}
				},
				ref: ref
			};
			node.subscriptions[topic][ref] = sub;
			if (node.connected) {
				node.client.on('message', sub.handler);
				var options = {};
				options.qos = qos;
				node.client.subscribe(topic, options);
			}
		};
		
		this.unsubscribe = function(topic, ref) {
			ref = ref || 0;
			var sub = node.subscriptions[topic];
			if (sub) {
				if (sub[ref]) {
					node.client.removeListener('message', sub[ref].handler);
					delete sub[ref];
				}
				if (Object.keys(sub).length === 0) {
					delete node.subscriptions[topic];
					if (node.connected) {
						node.client.unsubscribe(topic);
					}
				}
			}
		};
		
		this.publish = function(msg) {
			if (node.connected) {
				if (msg.payload === null || msg.payload === undefined) {
					msg.payload = "";
				} else if (!Buffer.isBuffer(msg.payload)) {
					if (typeof msg.payload === "object") {
						msg.payload = JSON.stringify(msg.payload);
					} else if (typeof msg.payload !== "string") {
						msg.payload = "" + msg.payload;
					}
				}
				
				var options = {
					qos: msg.qos || 0,
					retain: msg.retain || false
				};
				node.client.publish(msg.topic, msg.payload, options, function(err) {
					return
				});
			}
		};
		
		this.on('close', function(done) {
			this.closing = true;
			if (this.connected) {
				// Send close message
				if (node.closeMessage) {
					node.publish(node.closeMessage);
				}
				this.client.once('close', function() {
					done();
				});
				this.client.end();
			} else if (this.connecting || node.client.reconnecting) {
				node.client.end();
				done();
			} else {
				done();
			}
		});
		
	}
	
	RED.nodes.registerType("ppmp-mqtt-broker", PPMPMQTTBrokerNode, {
		credentials: {
			user: {
				type: "text"
			},
			password: {
				type: "password"
			}
		}
	});
	
	function PPMPMachineInNode(n) {
		initalizeInNode(this, n, MACHINE_CONTENT_SPEC);
		
	}
	RED.nodes.registerType("machine-in", PPMPMachineInNode);
	
	function PPMPMeasurementInNode(n) {
		initalizeInNode(this, n, MEASUREMENT_CONTENT_SPEC);
	}
	RED.nodes.registerType("measurement-in", PPMPMeasurementInNode);
	
	function PPMPProcessInNode(n) {
		initalizeInNode(this, n, PROCESS_CONTENT_SPEC);
		
	}
	RED.nodes.registerType("process-in", PPMPProcessInNode);
	
	function PPMPInNode(n) {
		RED.nodes.createNode(this, n);
		var node = this;
		this.topic = n.topic;
		this.qos = parseInt(n.qos);
		this.mqtt = n.mqtt;
		if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
			this.qos = 2;
		}
		this.broker = n.broker;
		this.brokerConn = RED.nodes.getNode(this.broker);
		if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(this.topic)) {
			return this.warn(RED._("mqtt.errors.invalid-topic"));
		}
		if (this.brokerConn) {
			this.status({
				fill: "red",
				shape: "ring",
				text: "node-red:common.status.disconnected"
			});
			if (this.topic) {
				node.brokerConn.register(this);
				this.brokerConn.subscribe(this.topic, this.qos, function(topic, payload, packet) {
					if (isUtf8(payload)) {
						payload = payload.toString();
					}
					var jsonPayload = JSON.parse(payload);
					if (!checkforexistingcontentspec(jsonPayload)) {
						msg = {
							topic: topic,
							payload: response.errors,
							qos: packet.qos,
							retain: packet.retain
						};
						node.send(createMessage(node, node.topic, packet, JSON.parse('{"errors":[{"message":"Payload doesnt contain a content-spec"}]}'), jsonPayload));
					} else {
						var contentspec = jsonPayload["content-spec"];
						validateInput(contentspec, jsonPayload, function(response) {
							console.log("DEBUG: " + payload + " Errors: " + response.errors.length);
							if (response.errors.length == 0) {
								var msg1 = null;
								var msg2 = null;
								var msg3 = null;
								if (jsonPayload["content-spec"] == MACHINE_CONTENT_SPEC) {
									msg1 = {
										content_spec: jsonPayload["content-spec"],
										device: jsonPayload["device"],
										messages: jsonPayload["messages"],
										topic: topic,
										payload: jsonPayload,
										qos: packet.qos,
										retain: packet.retain
									};
									if ((node.brokerConn.broker === "localhost") || (node.brokerConn.broker === "127.0.0.1")) {
										msg1._topic = topic;
									}
								} else if (jsonPayload["content-spec"] == MEASUREMENT_CONTENT_SPEC) {
									msg2 = {
										content_spec: jsonPayload["content-spec"],
										device: jsonPayload["device"],
										measurements: jsonPayload["measurements"],
										part: jsonPayload["part"],
										payload: jsonPayload,
										qos: packet.qos,
										retain: packet.retain
									};
									if ((node.brokerConn.broker === "localhost") || (node.brokerConn.broker === "127.0.0.1")) {
										msg2._topic = topic;
									}
								} else if (jsonPayload["content-spec"] == PROCESS_CONTENT_SPEC) {
									msg3 = {
										content_spec: jsonPayload["content-spec"],
										device: jsonPayload["device"],
										measurements: jsonPayload["measurements"],
										part: jsonPayload["part"],
										process: jsonPayload["process"],
										topic: topic,
										payload: jsonPayload,
										qos: packet.qos,
										retain: packet.retain
									};
									if ((node.brokerConn.broker === "localhost") || (node.brokerConn.broker === "127.0.0.1")) {
										msg3._topic = topic;
									}
								}
							} else {
								msg1 = {
									topic: topic,
									payload: response.errors,
									qos: packet.qos,
									retain: packet.retain
								};
								msg2 = {
									topic: topic,
									payload: response.errors,
									qos: packet.qos,
									retain: packet.retain
								};
								msg3 = {
									topic: topic,
									payload: response.errors,
									qos: packet.qos,
									retain: packet.retain
								};
							}
							node.send([msg1, msg2, msg3]);
						});
					}
				}, this.id);
				if (this.brokerConn.connected) {
					node.status({
						fill: "green",
						shape: "dot",
						text: "node-red:common.status.connected"
					});
				}
			} else {
				this.error(RED._("ppmp-mqtt.errors.not-defined"));
			}
			this.on('close', function(done) {
				if (node.brokerConn) {
					node.brokerConn.unsubscribe(node.topic, node.id);
					node.brokerConn.deregister(node, done);
				}
			});
		} else {
			this.error(RED._("ppmp-mqtt.errors.missing-config"));
		}
		
	}
	RED.nodes.registerType("ppmp-in", PPMPInNode);
	
	function PPMPValidate(n) {
		RED.nodes.createNode(this, n);
		var node = this;
		node.on('input', function(msg) {
			if (isUtf8(msg)) {
				msg = msg.toString();
			}
			var jsonMsg = JSON.parse(msg);
			if (!checkforexistingcontentspec(jsonMsg)) {
				msg = response.errors;
				node.send(createMessage(node, node.topic, packet, JSON.parse('{"errors":[{"message":"Payload doesnt contain a content-spec"}]}'), jsonMsgjsonMsgjsonMsg));
			} else {
				var contentspec = jsonMsg["content-spec"];
				validateInput(contentspec, jsonMsg, function(response) {
					console.log("DEBUG: " + msg + " Errors: " + response.errors.length);
					if (response.errors.length == 0) {
						var msg = jsonMsg;
					} else {
						msg = response.errors;
					}
					node.send(msg);
				});
			}
		}, this.id);
	}
	RED.nodes.registerType("validate", PPMPValidate);
	
	function PPMPMessageOutNode(n) {
		console.log(n);
		RED.nodes.createNode(this, n);
		var node = this;
		this.topic = n.topic;
		this.qos = parseInt(n.qos);
		this.mqtt = n.mqtt;
		if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
			this.qos = 2;
		}
		this.broker = n.broker;
		this.brokerConn = RED.nodes.getNode(this.broker);
		if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(this.topic)) {
			return this.warn(RED._("mqtt.errors.invalid-topic"));
		}
		if (this.brokerConn) {
			this.status({
				fill: "red",
				shape: "ring",
				text: "node-red:common.status.disconnected"
			});
			if (this.topic) {
				node.brokerConn.register(this);
				var payload = "test"
				var msg = {
					topic: this.topic,
					payload: payload,
					qos: this.packet.qos,
					retain: this.packet.retain
				};
				this.brokerConn.publish(msg);
				if (this.brokerConn.connected) {
					node.status({
						fill: "green",
						shape: "dot",
						text: "node-red:common.status.connected"
					});
				}
			} else {
				this.error(RED._("ppmp-mqtt.errors.not-defined"));
			}
			this.on('close', function(done) {
				if (node.brokerConn) {
					node.brokerConn.unsubscribe(node.topic, node.id);
					node.brokerConn.deregister(node, done);
				}
			});
		} else {
			this.error(RED._("ppmp-mqtt.errors.missing-config"));
		}
		
	}
	RED.nodes.registerType("message-out", PPMPMessageOutNode);
	
	function PPMPMeasurementOutNode(n) {
		console.log(n);
		RED.nodes.createNode(this, n);
		var node = this;
		this.topic = n.topic;
		this.qos = parseInt(n.qos);
		if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
			this.qos = 2;
		}
		this.broker = n.broker;
		this.brokerConn = RED.nodes.getNode(this.broker);
		if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(this.topic)) {
			return this.warn(RED._("mqtt.errors.invalid-topic"));
		}
		if (this.brokerConn) {
			this.status({
				fill: "red",
				shape: "ring",
				text: "node-red:common.status.disconnected"
			});
			if (this.topic) {
				node.brokerConn.register(this);
				var payload = "test"
				var msg = {
					topic: this.topic,
					payload: payload,
					qos: this.packet.qos,
					retain: this.packet.retain
				};
				this.brokerConn.publish(msg);
				if (this.brokerConn.connected) {
					node.status({
						fill: "green",
						shape: "dot",
						text: "node-red:common.status.connected"
					});
				}
			} else {
				this.error(RED._("ppmp-mqtt.errors.not-defined"));
			}
			this.on('close', function(done) {
				if (node.brokerConn) {
					node.brokerConn.unsubscribe(node.topic, node.id);
					node.brokerConn.deregister(node, done);
				}
			});
		} else {
			this.error(RED._("ppmp-mqtt.errors.missing-config"));
		}
		
	}
	RED.nodes.registerType("measurement-out", PPMPMeasurementOutNode);
	
	function PPMPProcessOutNode(n) {
		console.log(n);
		RED.nodes.createNode(this, n);
		var node = this;
		this.topic = n.topic;
		this.qos = parseInt(n.qos);
		if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
			this.qos = 2;
		}
		this.broker = n.broker;
		this.brokerConn = RED.nodes.getNode(this.broker);
		if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(this.topic)) {
			return this.warn(RED._("mqtt.errors.invalid-topic"));
		}
		if (this.brokerConn) {
			this.status({
				fill: "red",
				shape: "ring",
				text: "node-red:common.status.disconnected"
			});
			if (this.topic) {
				node.brokerConn.register(this);
				var payload = "test"
				var msg = {
					topic: this.topic,
					payload: payload,
					qos: this.packet.qos,
					retain: this.packet.retain
				};
				this.brokerConn.publish(msg);
				if (this.brokerConn.connected) {
					node.status({
						fill: "green",
						shape: "dot",
						text: "node-red:common.status.connected"
					});
				}
			} else {
				this.error(RED._("ppmp-mqtt.errors.not-defined"));
			}
			this.on('close', function(done) {
				if (node.brokerConn) {
					node.brokerConn.unsubscribe(node.topic, node.id);
					node.brokerConn.deregister(node, done);
				}
			});
		} else {
			this.error(RED._("ppmp-mqtt.errors.missing-config"));
		}
		
	}
	RED.nodes.registerType("process-out", PPMPProcessOutNode);
	
	function PPMPOutNode(n) {
		console.log("1");
		RED.nodes.createNode(this, n);
		console.log("2");
		var node = this;
		console.log("3");
		this.topic = n.topic;
		console.log("4");
		this.qos = parseInt(n.qos);
		console.log("5");
		if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
			this.qos = 2;
		}
		console.log("6");
		this.broker = n.broker;
		console.log("7");
		this.brokerConn = RED.nodes.getNode(this.broker);
		console.log("8");
		if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(this.topic)) {
			return this.warn(RED._("mqtt.errors.invalid-topic"));
		}
		console.log("9");
		if (this.brokerConn) {
			console.log("10");
			this.status({
				fill: "red",
				shape: "ring",
				text: "node-red:common.status.disconnected"
			});
			console.log("11");
			if (this.topic) {
				console.log("12");
				node.brokerConn.register(this);
				var payload = "test"
				var msg = {
					topic: this.topic,
					payload: payload,
					qos: this.packet.qos,
					retain: this.packet.retain
				};
				this.brokerConn.publish(msg);
				if (this.brokerConn.connected) {
					node.status({
						fill: "green",
						shape: "dot",
						text: "node-red:common.status.connected"
					});
				}
			} else {
				this.error(RED._("ppmp-mqtt.errors.not-defined"));
			}
			this.on('close', function(done) {
				if (node.brokerConn) {
					node.brokerConn.unsubscribe(node.topic, node.id);
					node.brokerConn.deregister(node, done);
				}
			});
		} else {
			this.error(RED._("ppmp-mqtt.errors.missing-config"));
		}
		
	}
	RED.nodes.registerType("ppmp-out", PPMPOutNode);
}
