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
    Artemis.log.info("loading sessions");
    Artemis._module.component('artemisSessions', {
        template:
            `<h1>Browse Sessions</h1>
             <div ng-include="'plugin/artemistoolbar.html'"></div>
             <pf-table-view config="$ctrl.tableConfig"
                            columns="$ctrl.tableColumns"
                            action-buttons="$ctrl.tableActionButtons"
                            items="$ctrl.sessions">
             </pf-table-view>
             <div ng-include="'plugin/pagination.html'"></div>
             <div hawtio-confirm-dialog="$ctrl.closeDialog" title="Close Session?"
                 ok-button-text="Close"
                 cancel-button-text="Cancel"
                 on-ok="$ctrl.closeSession()">
                 <div class="dialog-body">
                     <p class="alert alert-warning">
                         <span class="pficon pficon-warning-triangle-o"></span>
                         You are about to close the selected session: {{$ctrl.sessionToDelete}}
                         <p>Are you sure you want to continue.</p>
                     </p>
                 </div>
             </div>
             `,
              controller: SessionsController
    })
    .name;


    function SessionsController($scope, workspace, jolokia, localStorage, artemisMessage, $location, $timeout, $filter, pagination, artemisConnection, artemisSession, artemisConsumer, artemisProducer) {
        var ctrl = this;
        ctrl.pagination = pagination;
        var mbean = Artemis.getBrokerMBean(workspace, jolokia);
        ctrl.allSessions = [];
        ctrl.sessions = [];
        ctrl.pageNumber = 1;
        ctrl.workspace = workspace;
        ctrl.refreshed = false;
        ctrl.sessionToDeletesConnection = '';
        ctrl.sessionToDelete = '';
        ctrl.closeDialog = false;
        ctrl.filter = {
            fieldOptions: [
                {id: 'ID', name: 'ID'},
                {id: 'CONNECTION_ID', name: 'Connection ID'},
                {id: 'CONSUMER_COUNT', name: 'Consumer Count'},
                {id: 'USER', name: 'User'},
                {id: 'PROTOCOL', name: 'Protocol'},
                {id: 'CLIENT_ID', name: 'Client ID'},
                {id: 'LOCAL_ADDRESS', name: 'Local Address'},
                {id: 'REMOTE_ADDRESS', name: 'Remote Address'}
            ],
            operationOptions: [
                {id: 'EQUALS', name: 'Equals'},
                {id: 'CONTAINS', name: 'Contains'},
                {id: 'GREATER_THAN', name: 'Greater Than'},
                {id: 'LESS_THAN', name: 'Less Than'}
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
        ctrl.tableActionButtons = [
           {
            name: 'Close',
            title: 'Close the Session',
            actionFn: openCloseDialog
           }
        ];
        ctrl.tableConfig = {
            selectionMatchProp: 'id',
            showCheckboxes: false
        };
        ctrl.tableColumns = [
            { header: 'ID', itemField: 'id' },
            { header: 'Connection', itemField: 'connectionID', templateFn: function(value, item) { return '<a href="#" onclick="selectConnection(\'' + item.connectionID + '\')">' + value + '</a>' }},
            { header: 'User', itemField: 'user' },
            { header: 'Consumer Count', itemField: 'consumerCount', templateFn: function(value, item) { return '<a href="#" onclick="selectConsumers(\'' + item.id + '\')">' + value + '</a>' }},
            { header: 'Producer Count', itemField: 'producerCount', templateFn: function(value, item) { return '<a href="#" onclick="selectProducers(\'' + item.id + '\')">' + value + '</a>' }},
            { header: 'Creation Time', itemField: 'creationTime' }
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
            artemisConnection.connection = null;
            artemisSession.session = null;
            artemisConsumer.consumer = null;
            ctrl.pagination.load();
        };

        selectConnection = function (connection) {
            Artemis.log.info("navigating to connection:" + connection)
            artemisSession.session = { connectionID: connection };
            $location.path("artemis/artemisConnections");
        };

        selectConsumers = function (session) {
            Artemis.log.info("navigating to consumers:" + session)
            artemisConsumer.consumer = { sessionID: session };
            $location.path("artemis/artemisConsumers");
        };

        selectProducers = function (session) {
            Artemis.log.info("navigating to producers:" + session)
            artemisProducer.producer = { sessionID: session };
            $location.path("artemis/artemisProducers");
        };

        if (artemisConnection.connection) {
            Artemis.log.info("navigating to connection = " + artemisConnection.connection.connectionID);
            ctrl.filter.values.field = ctrl.filter.fieldOptions[1].id;
            ctrl.filter.values.operation = ctrl.filter.operationOptions[0].id;
            ctrl.filter.values.value = artemisConnection.connection.connectionID;
        }

        if (artemisSession.session) {
            Artemis.log.info("navigating to session = " + artemisSession.session.session);
            ctrl.filter.values.field = ctrl.filter.fieldOptions[0].id;
            ctrl.filter.values.operation = ctrl.filter.operationOptions[0].id;
            ctrl.filter.values.value = artemisSession.session.session;
        }

        function openCloseDialog(action, item) {
            ctrl.sessionToDelete = item.id;
            ctrl.sessionToDeletesConnection = item.connectionID;
            ctrl.closeDialog = true;
        }

        ctrl.closeSession = function () {
           Artemis.log.info("closing session: " + ctrl.sessionToDelete);
              if (mbean) {
                  jolokia.request({ type: 'exec',
                     mbean: mbean,
                     operation: 'closeSessionWithID(java.lang.String,java.lang.String)',
                     arguments: [ctrl.sessionToDeletesConnection, ctrl.sessionToDelete] },
                     Core.onSuccess(ctrl.pagination.load(), { error: function (response) {
                        Core.defaultJolokiaErrorHandler("Could not close session: " + response);
                 }}));
           }
        };
        ctrl.loadOperation = function () {
            if (mbean) {
                var method = 'listSessions(java.lang.String, int, int)';
                var sessionsFilter = {
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
                jolokia.request({ type: 'exec', mbean: mbean, operation: method, arguments: [JSON.stringify(sessionsFilter), ctrl.pagination.pageNumber, ctrl.pagination.pageSize] }, Core.onSuccess(populateTable, { error: onError }));
            }
        };

        ctrl.pagination.setOperation(ctrl.loadOperation);

        function onError(response) {
            Core.notification("error", "could not invoke list sessions" + response.error);
            $scope.workspace.selectParentNode();
        };

        function populateTable(response) {
            var data = JSON.parse(response.value);
            ctrl.sessions = [];
            angular.forEach(data["data"], function (value, idx) {
                ctrl.sessions.push(value);
            });
            ctrl.pagination.page(data["count"]);
            allSessions = ctrl.sessions;
            ctrl.sessions = allSessions;
            Core.$apply($scope);
        }

        ctrl.pagination.load();
    }
    SessionsController.$inject = ['$scope', 'workspace', 'jolokia', 'localStorage', 'artemisMessage', '$location', '$timeout', '$filter', 'pagination', 'artemisConnection', 'artemisSession', 'artemisConsumer', 'artemisProducer'];


})(Artemis || (Artemis = {}));