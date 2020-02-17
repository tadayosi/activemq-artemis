/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 /// <reference path="tree.component.ts"/>
var Artemis;
(function (Artemis) {
    Artemis.brokerDiagramModule = angular
    .module('artemis-broker-diagram', [])
    .component('artemisBrokerDiagram', {
        template:
            `<div class="container-topology">
                <h1>Broker Diagram</h1>
                <pf-topology items="$ctrl.data.items" relations="$ctrl.data.relations" kinds="$ctrl.kinds" icons="$ctrl.data.icons" nodes="$ctrl.nodes" item-selected="itemSelected(item)" search-text="searchText" show-labels="$ctrl.showLabels" tooltip-function="$ctrl.tooltip(node)">
            </div>
            <div>
                <label>Show labels:
                    <input type="checkbox" ng-model="$ctrl.showLabels">
                </label>
                 <label>Show addresses:
                    <input type="checkbox" ng-model="$ctrl.showAddresses">
                </label>
                <label>Show queues:
                    <input type="checkbox" ng-model="$ctrl.showQueues">
                </label>
                <label>Show internal addresses:
                    <input type="checkbox" ng-model="$ctrl.showInternalAddresses">
                </label>
                <label>Show internal queues:
                    <input type="checkbox" ng-model="$ctrl.showInternalQueues">
                </label>
                <button type="submit" class="btn btn-primary"
                    ng-click="$ctrl.refresh()">Refresh
                </button>
            </div>
        `,
        controller: BrokerDiagramController
    })
    .name;


    function BrokerDiagramController($scope, workspace, jolokia, localStorage, artemisMessage, $location, $timeout, $filter) {
        Artemis.log.info("loaded browse " + Artemis.browseQueueModule);
        var ctrl = this;
        ctrl.index = 0;
        ctrl.showLabels = false;
        ctrl.showAddresses = true;
        ctrl.showQueues = true;
        ctrl.showInternalAddresses = false;
        ctrl.showInternalQueues = false;
        $scope.$watch('$ctrl.showAddresses', function () {
            if(ctrl.kinds.Address && !ctrl.showAddresses) {
               delete ctrl.kinds.Address;
            } else if (!ctrl.kinds.Address && ctrl.showAddresses) {
                ctrl.kinds.Address = true;
            }
        });
        $scope.$watch('$ctrl.showQueues', function () {
            if(ctrl.kinds.Queue && !ctrl.showQueues) {
               delete ctrl.kinds.Queue;
            } else if (!ctrl.kinds.Queues && ctrl.showQueues) {
                ctrl.kinds.Queue = true;
            }
        });
        $scope.$watch('$ctrl.showInternalAddresses', function () {
            if(ctrl.kinds.InternalAddress && !ctrl.showInternalAddresses) {
               delete ctrl.kinds.InternalAddress;
            } else if (!ctrl.kinds.InternalAddress && ctrl.showInternalAddresses) {
                ctrl.kinds.InternalAddress = true;
            }
        });
        $scope.$watch('$ctrl.showInternalQueues', function () {
            if(ctrl.kinds.InternalQueue && !ctrl.showInternalQueues) {
               delete ctrl.kinds.InternalQueue;
            } else if (!ctrl.kinds.InternalQueues && ctrl.showInternalQueues) {
                ctrl.kinds.InternalQueue = true;
            }
        });
        ctrl.datasets = [];
        //icons can be found at https://www.patternfly.org/v3/styles/icons/index.html
        ctrl.serverIcon = "\ue90d";
        Artemis.log.info(ctrl.serverIcon);
        ctrl.addressIcon = "";//\ue91a";
        ctrl.queueIcon = "";//\ue90a";
        ctrl.icons = {
            "ThisBroker": {
              "type": "glyph",
              "icon": ctrl.serverIcon,
              "background": "#456BD9",
              "fontfamily": "PatternFlyIcons-webfont"
            },
            "MasterBroker": {
              "type": "glyph",
              "icon": ctrl.serverIcon,
              "fontfamily": "PatternFlyIcons-webfont"
            },
            "SlaveBroker": {
              "type": "glyph",
              "icon": ctrl.serverIcon,
              "fontfamily": "PatternFlyIcons-webfont"
            },
            "Address": {
                "type": "glyph",
                "icon": ctrl.addressIcon,
                "fontfamily": "PatternFlyIcons-webfont"
            },
            "InternalAddress": {
                "type": "glyph",
                "icon": ctrl.addressIcon,
                "fontfamily": "PatternFlyIcons-webfont"
            },
            "Queue": {
                "type": "glyph",
                "background": "#456BD9",
                "icon": ctrl.queueIcon,
                "fontfamily": "PatternFlyIcons-webfont"
            },
            "InternalQueue": {
                "type": "glyph",
                "background": "#456BD9",
                "icon": ctrl.queueIcon,
                "fontfamily": "PatternFlyIcons-webfont"
            }
        };

        load();

        function load() {
            ctrl.items = {};

            ctrl.relations = [];

            ctrl.datasets.push({
                "items": ctrl.items,
                "relations": ctrl.relations,
                "icons": ctrl.icons
            });

            Artemis.log.info("index " + ctrl.index);

            ctrl.data = ctrl.datasets[ctrl.index];

            ctrl.data.url = "fooBar";

            ctrl.kinds = {
                "ThisBroker": true,
                "MasterBroker": true,
                "SlaveBroker": true,
                "Address": true,
                "Queue": true
            };

            ctrl.icons = ctrl.data.icons;

            ctrl.nodes = {
                "ThisBroker": {
                     "name": "ThisBroker",
                     "title": "hello",
                     "enabled": true,
                     "radius": 28,
                     "textX": 0,
                     "textY": 5,
                     "height": 30,
                     "width": 30,
                     "icon": ctrl.icons["ThisBroker"].icon,
                     "fontFamily": ctrl.icons["ThisBroker"].fontfamily
                   },
                "MasterBroker": {
                    "name": "MasterBroker",
                    "enabled": true,
                    "radius": 28,
                    "textX": 0,
                    "textY": 5,
                    "height": 30,
                    "width": 30,
                    "icon": ctrl.icons["MasterBroker"].icon,
                    "fontFamily": ctrl.icons["MasterBroker"].fontfamily
                },
                "SlaveBroker": {
                    "name": "SlaveBroker",
                    "enabled": true,
                    "radius": 28,
                    "textX": 0,
                    "textY": 5,
                    "height": 30,
                    "icon": ctrl.icons["SlaveBroker"].icon,
                    "fontFamily": ctrl.icons["SlaveBroker"].fontfamily
                },
                "Address": {
                    "name": "Address",
                    "enabled": ctrl.showDestinations,
                    "radius": 16,
                    "textX": 0,
                    "textY": 5,
                    "height": 18,
                    "width": 18,
                    "icon": ctrl.icons["Address"].icon,
                    "fontFamily": ctrl.icons["Address"].fontfamily
                },
                "Queue": {
                    "name": "Queue",
                    "enabled": ctrl.showDestinations,
                    "radius": 16,
                    "textX": 0,
                    "textY": 5,
                    "height": 18,
                    "width": 18,
                    "icon": ctrl.icons["Queue"].icon,
                    "fontFamily": ctrl.icons["Queue"].fontfamily
                }
            };


            loadThisBroker();
        }
        ctrl.tooltip = function (node) {
            var status = [
                'Name: ' + node.item.name,
                'Type: ' + node.item.brokerKind,
                'Status: ' + node.item.status
            ];
            return status;
        }
        ctrl.refresh = function () {
            ctrl.datasets = [];
            load();
        }

        function loadThisBroker() {
            //var req1 = { type: "read", mbean: mBean};
            var mBean = Artemis.getBrokerMBean(workspace, jolokia);
            var atts = jolokia.request({ type: "read", mbean: mBean}, {method: "post"});
            var val = atts.value;
            var details = Core.parseMBean(mBean);

            if (details) {
                var properties = details['attributes'];
                Artemis.log.info("Got broker: " + mBean + " properties: " + angular.toJson(properties, true));
                if (properties) {
                    var brokerAddress = properties["broker"] || "unknown";
                    var brokerName = artemisJmxDomain + ":broker=" + brokerAddress;
                    var backupRes = jolokia.request({ type: "read", mbean: mBean, attribute: "Backup"}, {method: "get"});

                    var isBackup = backupRes.value;
                    var nodeId = val["NodeID"];
                    var response = jolokia.request({ type: 'exec', mbean: mBean, operation: 'listNetworkTopology()' }, Core.onSuccess(null));
                    var responseValue = response.value;
                    var remoteBrokers = angular.fromJson(responseValue);
                    var thisBroker = remoteBrokers.find(broker => broker.nodeID == nodeId);
                    if (isBackup) {
                    } else {
                        ctrl.items[thisBroker.live] = {
                            "name": thisBroker.live,
                            "kind": "ThisBroker",
                            "brokerKind": "master",
                            "status": "broker",
                            "display_kind": "Server"
                        }
                        if (thisBroker.backup) {
                            ctrl.items[thisBroker.backup] = {
                                "name": thisBroker.backup,
                                "kind": "SlaveBroker",
                                "brokerKind": "slave",
                                "status": "broker",
                                "display_kind": "Server"
                            };
                            ctrl.relations.push({
                                "source": thisBroker.live,
                                "target": thisBroker.backup
                            });
                        }
                        createAddresses(mBean, thisBroker.live)
                    }
                }

                angular.forEach(remoteBrokers, function (remoteBroker) {
                    if (nodeId != remoteBroker.nodeID) {
                       if (remoteBroker.live) {
                          ctrl.items[remoteBroker.live] = {
                              "name": remoteBroker.live,
                              "kind": "MasterBroker",
                              "brokerKind": "master",
                              "status": "broker",
                              "display_kind": "Server"
                          };
                          //if we arent a backup then connect to it as we are in the cluster
                          if(!isBackup) {}
                              ctrl.relations.push({
                                  "source": thisBroker.live,
                                  "target": remoteBroker.live
                              });
                          }
                          if (remoteBroker.backup) {
                              ctrl.items[remoteBroker.backup] = {
                                  "name": remoteBroker.backup,
                                  "kind": "SlaveBroker",
                                  "brokerKind": "slave",
                                  "status": "broker",
                                  "display_kind": "Server"
                              };
                              ctrl.relations.push({
                                 "source": remoteBroker.backup,
                                 "target": remoteBroker.live
                              });
                          }
                    }
                });
            }
        }

        function createAddresses(brokerMBean, brokerId) {
           jolokia.search(brokerMBean + ",component=addresses,*", Core.onSuccess(function (response) {
              angular.forEach(response, function (objectName) {
                 var details = Core.parseMBean(objectName);
                 if (details) {
                    var properties = details['attributes'];
                    if (properties) {
                        if (!properties.subcomponent) {

                           Artemis.log.info("Got Address: " + objectName + " properties: " + angular.toJson(properties, true));
                           addressKind = properties.address.startsWith("$", 1) || properties.address.startsWith("notif", 1) ? "InternalAddress" : "Address";
                           ctrl.items[properties.address] = {
                               "name": properties.address,
                               "kind": addressKind,
                               "brokerKind": "address",
                               "status": "Valid",
                               "display_kind": "Server"
                           }
                           ctrl.relations.push({
                               "source": brokerId,
                               "target": properties.address
                           });
                        }
                        if (properties.queue) {
                            Artemis.log.info("Got Queue: " + objectName + " properties: " + angular.toJson(properties, true));
                            queueKind = properties.queue.startsWith("$", 1) || properties.queue.startsWith("notif", 1) ? "InternalQueue" : "Queue";
                            ctrl.items["queue." + properties.queue] = {
                               "name": properties.queue,
                               "kind": queueKind,
                               "brokerKind": "queue",
                               "status": "Valid",
                               "display_kind": "Service"
                           }
                           ctrl.relations.push({
                               "source": properties.address,
                               "target": "queue." + properties.queue
                           });
                        }
                    }
                 }
              });
           }));
        }
    }
    BrokerDiagramController.$inject = ['$scope', 'workspace', 'jolokia', 'localStorage', 'artemisMessage', '$location', '$timeout', '$filter'];

})(Artemis || (Artemis = {}));
