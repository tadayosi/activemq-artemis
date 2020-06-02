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
var Artemis;
(function (Artemis) {
    Artemis.log.info("loading producers");
    Artemis._module.component('artemisProducers', {
        template:
            `<h1>Browse Consumers</h1>
             <div ng-include="'plugin/artemistoolbar.html'"></div>
             <pf-table-view config="$ctrl.tableConfig"
                            columns="$ctrl.tableColumns"
                            items="$ctrl.producers">
             </pf-table-view>
             <div ng-include="'plugin/pagination.html'"></div>
             `,
              controller: ProducersController
    })
    .name;


    function ProducersController($scope, workspace, jolokia, localStorage, artemisMessage, $location, $timeout, $filter, pagination, artemisProducer, artemisAddress, artemisSession) {
        var ctrl = this;
        ctrl.pagination = pagination;
        var mbean = Artemis.getBrokerMBean(workspace, jolokia);
        ctrl.allProducers = [];
        ctrl.producers = [];
        ctrl.pageNumber = 1;
        ctrl.workspace = workspace;
        ctrl.refreshed = false;
        ctrl.filter = {
            fieldOptions: [
                {id: 'ID', name: 'ID'},
                {id: 'SESSION_ID', name: 'Session ID'},
                {id: 'CLIENT_ID', name: 'Client ID'},
                {id: 'USER', name: 'User'},
                {id: 'ADDRESS', name: 'Address'},
                {id: 'PROTOCOL', name: 'Protocol'},
                {id: 'LOCAL_ADDRESS', name: 'Local Address'},
                {id: 'REMOTE_ADDRESS', name: 'Remote Address'}
            ],
            operationOptions: [
                {id: 'EQUALS', name: 'Equals'},
                {id: 'CONTAINS', name: 'Contains'}
            ],
            sortOptions: [
                {id: 'asc', name: 'ascending'},
                {id: 'desc', name: 'descending'}
            ],
            values: {
                field: "",
                operation: "",
                value: "",
                sortOrder: "asc",
                sortColumn: "id"
            }
        };
        ctrl.tableConfig = {
            selectionMatchProp: 'id',
            showCheckboxes: false
        };
        ctrl.tableColumns = [
            { header: 'ID', itemField: 'id' },
            { header: 'Session', itemField: 'session' , templateFn: function(value, item) { return '<a href="#" onclick="selectSession(\'' + item.session + '\')">' + value + '</a>' }},
            { header: 'Client ID', itemField: 'clientID' },
            { header: 'Protocol', itemField: 'protocol' },
            { header: 'User', itemField: 'user' },
            { header: 'Address', itemField: 'address', templateFn: function(value, item) { return '<a href="#" onclick="selectAddress(\'' + item.address + '\')">' + value + '</a>' }},
            { header: 'Remote Address', itemField: 'remoteAddress' },
            { header: 'Local Address', itemField: 'localAddress' }
        ];

        ctrl.refresh = function () {
            ctrl.refreshed = true;
            ctrl.pagination.load();
        };
        ctrl.reset = function () {
            ctrl.filter.values.field = "";
            ctrl.filter.values.operation = "";
            ctrl.filter.values.value = "";
            ctrl.filter.sortOrder = "asc";
            ctrl.filter.sortColumn = "id";
            ctrl.refreshed = true;
            artemisProducer.producer = null;
            ctrl.pagination.load();
        };

        selectAddress = function (address) {
            Artemis.log.info("navigating to address:" + address)
            artemisAddress.address = { address: address };
            $location.path("artemis/artemisAddresses");
        };

        selectSession = function (session) {
            Artemis.log.info("navigating to session:" + session)
            artemisSession.session = { session: session };
            $location.path("artemis/artemisSessions");
        };

        if (artemisProducer.producer) {
            Artemis.log.info("navigating to producer = " + artemisProducer.producer.sessionID);
            ctrl.filter.values.field = ctrl.filter.fieldOptions[1].id;
            ctrl.filter.values.operation = ctrl.filter.operationOptions[0].id;
            ctrl.filter.values.value = artemisProducer.producer.sessionID;
        }

        ctrl.loadOperation = function () {
            if (mbean) {
                var method = 'listProducers(java.lang.String, int, int)';
                var producerFilter = {
                    field: ctrl.filter.values.field,
                    operation: ctrl.filter.values.operation,
                    value: ctrl.filter.values.value,
                    sortOrder: ctrl.filter.values.sortOrder,
                    sortColumn: ctrl.filter.values.sortColumn
                };

                if (ctrl.refreshed == true) {
                    ctrl.pagination.reset();
                    ctrl.refreshed = false;
                }
                jolokia.request({ type: 'exec', mbean: mbean, operation: method, arguments: [JSON.stringify(producerFilter), ctrl.pagination.pageNumber, ctrl.pagination.pageSize] }, Core.onSuccess(populateTable, { error: onError }));
            }
        };

        ctrl.pagination.setOperation(ctrl.loadOperation);

        function onError(response) {
            Core.notification("error", "could not invoke list sessions" + response.error);
            $scope.workspace.selectParentNode();
        };

        function populateTable(response) {
            var data = JSON.parse(response.value);
            ctrl.producers = [];
            angular.forEach(data["data"], function (value, idx) {
                ctrl.producers.push(value);
            });
            ctrl.pagination.page(data["count"]);
            allProducers = ctrl.producers;
            ctrl.producers = allProducers;
            Core.$apply($scope);
        }

        ctrl.pagination.load();
    }
    ProducersController.$inject = ['$scope', 'workspace', 'jolokia', 'localStorage', 'artemisMessage', '$location', '$timeout', '$filter', 'pagination', 'artemisProducer', 'artemisAddress', 'artemisSession'];


})(Artemis || (Artemis = {}));