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
    Artemis.log.info("loading status");
    Artemis.addressModule = angular
        .module('artemis-status', [])
        .component('artemisStatus', {
        template:
               `<div class="container-fluid">
                    <div class="row">
                        <div class="col-xs-12 col-sm-6 col-md-6 col-lg-4">
                              <pf-info-status-card status="$ctrl.infoStatus" show-top-border="true"></pf-info-status-card>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-2 text-center">
                            <label>'Address Memory Used'</label>
                            <pf-donut-pct-chart config="$ctrl.addressMemoryConfig" data="$ctrl.addressMemoryData" center-label="$ctrl.addressMemoryLabel"></pf-donut-pct-chart>
                        </div>
                          <div class="col-md-2 text-center">
                            <label>'Disc Used'</label>
                            <pf-donut-pct-chart config="$ctrl.discConfig" data="$ctrl.discData" center-label="$ctrl.discLabel"></pf-donut-pct-chart>
                          </div>
                    </div>
                </div>
        `,
        controller: StatusController
    })
    .name;
    Artemis.log.info("loaded address " + Artemis.addressModule);

    function StatusController($scope, workspace, jolokia, localStorage, $interval) {
        var ctrl = this;
        var mbean = Artemis.getBrokerMBean(workspace, jolokia);

        StatusController.prototype.$onInit = function () {
            jolokia.request({ type: 'read', mbean: mbean, attribute: 'Version'}, Core.onSuccess(function(response) {
                ctrl.infoStatus.info[0] = "version: " + response.value;
            }));
            loadStatus();
            ctrl.promise = $interval(function () { return loadStatus(); }, 5000);
        };
        StatusController.prototype.$onDestroy = function () {
            $interval.cancel(this.promise);
        };

        ctrl.infoStatus = {
          "title":"Broker Info",
          "href":"#",
          "iconClass": "pficon pficon-ok",
          "info":[
            "version",
            "uptime:",
            "started:"
          ]
        };
        ctrl.addressMemoryConfig = {
            'chartId': 'addressMemoryChart',
            'units': 'MB',
            'thresholds':{'warning':'75','error':'90'}
        };

        ctrl.addressMemoryData = {
            'used': '0',
            'total': '0'
        };
        ctrl.addressMemoryLabel = "used";

        ctrl.discConfig = {
            'chartId': 'discMemoryChart',
            'units': 'MB',
            'thresholds':{'warning':'75','error':'90'}
        };

        ctrl.discData = {
            'used': '0',
            'total': '0'
        };

        ctrl.discLabel = "used"

        function loadStatus() {
            Artemis.log.info("loading");
            jolokia.request({ type: 'read', mbean: mbean, attribute: 'GlobalMaxSize'}, Core.onSuccess(function(response) { ctrl.addressMemoryData.total = (response.value / 1048576).toFixed(2); ctrl.discData.total = ctrl.addressMemoryData.total }));
            jolokia.request({ type: 'read', mbean: mbean, attribute: 'AddressMemoryUsage'}, Core.onSuccess(function(response) { ctrl.addressMemoryData.used = (response.value / 1048576).toFixed(2); }));
            jolokia.request({ type: 'read', mbean: mbean, operation: 'DiscStoreUsage'}, {method: "get"}, Core.onSuccess(function(response) { ctrl.discData.used = (response.value / 1048576).toFixed(2); }));
            jolokia.request({ type: 'read', mbean: mbean, attribute: 'Uptime'}, Core.onSuccess(function(response) {
                ctrl.infoStatus.info[1] = "uptime: " + response.value;
            }));
            jolokia.request({ type: 'read', mbean: mbean, attribute: 'Started'}, Core.onSuccess(function(response) {
                ctrl.infoStatus.info[2] = "started: " + response.value;
                if(response.value == "false") {
                    ctrl.infoStatus.iconClass = "pficon pficon-error-circle-o";
                } else {
                    ctrl.infoStatus.iconClass = "pficon pficon-ok";
                }
            }));
        }
    }
    StatusController.$inject = ['$scope', 'workspace', 'jolokia', 'localStorage', '$interval'];

})(Artemis || (Artemis = {}));