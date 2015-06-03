/**
 *
 * This code is derived from https://github.com/node-red/node-red/blob/master/nodes/core/io/10-mqtt.js,
 * released by IBM, Inc. under the following licence:
 *
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * The modifications made by Nominet UK are released under the following licence:
 *
 * Copyright 2015 Nominet
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 **/

module.exports = function (RED) {
    "use strict";
    var connectionPool = require("./mqttConnectionPool.js");
    var isUtf8 = require('is-utf8');


    function MQTTPublish(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.qos = n.qos || null;
        this.retain = n.retain;

        var node = this;

        console.log(this);

        this.on("input", function (msg) {
            this.brokerConfig = msg.mqttBrokerConfig;

            if (this.brokerConfig.broker && this.brokerConfig.port && this.brokerConfig.clientid) {
                this.client = connectionPool.get(this.brokerConfig.broker, this.brokerConfig.port, this.brokerConfig.clientid, this.brokerConfig.username, this.brokerConfig.password);
                this.client.connect();


                if (msg.qos) {
                    msg.qos = parseInt(msg.qos);
                    if ((msg.qos !== 0) && (msg.qos !== 1) && (msg.qos !== 2)) {
                        msg.qos = null;
                    }
                }
                msg.qos = Number(node.qos || msg.qos || 0);
                msg.retain = node.retain || msg.retain || false;
                msg.retain = ((msg.retain === true) || (msg.retain === "true")) || false;
                if (node.topic) {
                    msg.topic = node.topic;
                }
                if (msg.hasOwnProperty("payload")) {
                    if (msg.hasOwnProperty("topic") && (typeof msg.topic === "string") && (msg.topic !== "")) { // topic must exist
                        this.client.publish(msg);  // send the message
                    }
                    else {
                        node.warn("Invalid topic specified");
                    }
                }
            }

        });




        this.on('close', function () {
            if (this.client) {
                this.client.disconnect();
            }
        });
    }

    RED.nodes.registerType("mqtt-publish", MQTTPublish);
}

