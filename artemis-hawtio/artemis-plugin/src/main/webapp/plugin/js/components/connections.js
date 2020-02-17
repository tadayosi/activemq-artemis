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
    Artemis.log.info("loading connections");
    Artemis._module.component('artemisConnections', {
        template:
            `<h1>Browse Connections</h1>
             <div ng-include="'plugin/artemistoolbar.html'"></div>
             <pf-table-view config="$ctrl.tableConfig"
                            columns="$ctrl.tableColumns"
                            action-buttons="$ctrl.tableActionButtons"
                            items="$ctrl.connections">
             </pf-table-view>
             <div ng-include="'plugin/artemispagination.html'"></div>
             <div hawtio-confirm-dialog="$ctrl.closeDialog" title="Close Connection?"
                ok-button-text="Close"
                cancel-button-text="Cancel"
                on-ok="$ctrl.closeConnection()">
                 <div class="dialog-body">
                    <p class="alert alert-warning">
                        <span class="pficon pficon-warning-triangle-o"></span>
                        You are about to close the selected connection: {{$ctrl.connectionToDelete}}
                        <p>Are you sure you want to continue.</p>
                    </p>
                 </div>
              </div>
              `,
              controller: ConnectionsController
    })
    .name;


    function ConnectionsController($scope, workspace, jolokia, localStorage, artemisMessage, $location, $timeout, $filter, pagination, artemisConnection, artemisSession) {
        var ctrl = this;
        ctrl.pagination = pagination;
        var mbean = Artemis.getBrokerMBean(workspace, jolokia);
        ctrl.allConnections = [];
        ctrl.connections = [];
        ctrl.pageNumber = 1;
        ctrl.workspace = workspace;
        ctrl.refreshed = false;
        ctrl.connectionToDelete = '';
        ctrl.closeDialog = false;
        ctrl.filter = {
            fieldOptions: [
                {id: 'CONNECTION_ID', name: 'Connection ID'},
                {id: 'CLIENT_ID', name: 'Client ID'},
                {id: 'USERS', name: 'Users'},
                {id: 'PROTOCOL', name: 'Protocol'},
                {id: 'SESSION_COUNT', name: 'Session Count'},
                {id: 'REMOTE_ADDRESS', name: 'Remote Address'},
                {id: 'LOCAL_ADDRESS', name: 'Local Address'},
                {id: 'SESSION_ID', name: 'Session ID'}
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
                sortColumn: "connectionID"
            }
        };

        ctrl.tableActionButtons = [
          {
            name: 'Close',
            title: 'Close the Connection',
            actionFn: openCloseDialog
          }
        ];

        ctrl.tableConfig = {
            selectionMatchProp: 'connectionID',
            showCheckboxes: false
        };
        ctrl.tableColumns = [
            { header: 'ID', itemField: 'connectionID' },
            { header: 'Client ID', itemField: 'clientID' },
            { header: 'Users', itemField: 'users' },
            { header: 'protocol', itemField: 'protocol' },
            { header: 'Session Count', itemField: 'sessionCount', templateFn: function(value, item) { return '<a href="#" onclick="selectSessions(\'' + item.connectionID + '\')">' + value + '</a>' }},
            { header: 'Remote Address', itemField: 'remoteAddress' },
            { header: 'Local Address', itemField: 'localAddress' },
            { header: 'Creation Time', itemField: 'creationTime' }
        ];

        selectSessions = function (connection) {
            Artemis.log.info("navigating to connection:" + connection)
            artemisConnection.connection = { connectionID: connection };
            $location.path("artemis/artemisSessions");
        };

        if (artemisSession.session) {
            Artemis.log.info("navigating to session = " + artemisSession.session.connectionID);
            ctrl.filter.values.field = ctrl.filter.fieldOptions[0].id;
            ctrl.filter.values.operation = ctrl.filter.operationOptions[0].id;
            ctrl.filter.values.value = artemisSession.session.connectionID;
        }

        ctrl.refresh = function () {
            ctrl.refreshed = true;
            ctrl.pagination.load();
        };
        ctrl.reset = function () {
            ctrl.filter.values.field = "";
            ctrl.filter.values.operation = "";
            ctrl.filter.values.value = "";
            ctrl.filter.sortOrder = "asc";
            ctrl.filter.sortColumn = "connectionID";
            ctrl.refreshed = true;
            artemisSession.session = null;
            ctrl.pagination.load();
        };

        ctrl.loadOperation = function () {
            if (mbean) {
                var method = 'listConnections(java.lang.String, int, int)';
                var connectionsFilter = {
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
                Artemis.log.info(JSON.stringify(connectionsFilter));
                jolokia.request({ type: 'exec', mbean: mbean, operation: method, arguments: [JSON.stringify(connectionsFilter), ctrl.pagination.pageNumber, ctrl.pagination.pageSize] }, Core.onSuccess(populateTable, { error: onError }));
            }
        };

        function openCloseDialog(action, item) {
            ctrl.connectionToDelete = item.connectionID;
            ctrl.closeDialog = true;
        }

        ctrl.closeConnection = function () {
           Artemis.log.info("closing connection: " + ctrl.connectionToDelete);
              if (mbean) {
                  jolokia.request({ type: 'exec',
                     mbean: mbean,
                     operation: 'closeConnectionWithID(java.lang.String)',
                     arguments: [ctrl.connectionToDelete] },
                     Core.onSuccess(ctrl.pagination.load(), { error: function (response) {
                        Core.defaultJolokiaErrorHandler("Could not close connection: " + response);
                 }}));
           }
        };

        pagination.setOperation(ctrl.loadOperation);

        function onError(response) {
            Core.notification("error", "could not invoke list connections" + response.error);
            $scope.workspace.selectParentNode();
        };

        function populateTable(response) {
            var data = JSON.parse(response.value);
            ctrl.connections = [];
            angular.forEach(data["data"], function (value, idx) {
                ctrl.connections.push(value);
            });
            ctrl.pagination.page(data["count"]);
            allConnections = ctrl.connections;
            ctrl.connections = allConnections;
            Core.$apply($scope);
        }

        ctrl.pagination.load();
    }
    ConnectionsController.$inject = ['$scope', 'workspace', 'jolokia', 'localStorage', 'artemisMessage', '$location', '$timeout', '$filter', 'pagination', 'artemisConnection', 'artemisSession'];


})(Artemis || (Artemis = {}));