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
    //Artemis.log.info("loading addresses");
    Artemis._module.component('artemisAddresses', {
        template:
            `<h1>Browse Addresses</h1>
             <div ng-include="'plugin/artemistoolbar.html'"></div>
             <pf-table-view config="$ctrl.tableConfig"
                            columns="$ctrl.tableColumns"
                            action-buttons="$ctrl.tableActionButtons"
                            items="$ctrl.addresses">
             </pf-table-view>
             <div ng-include="'plugin/pagination.html'"></div>
             `,
              controller: AddressesController
    })
    .name;


    function AddressesController($scope, workspace, jolokia, localStorage, artemisMessage, $location, $timeout, $filter, pagination, artemisAddress) {
        var ctrl = this;
        ctrl.pagination = pagination;
        var mbean = Artemis.getBrokerMBean(workspace, jolokia);
        ctrl.allAddresses = [];
        ctrl.addresses = [];
        ctrl.workspace = workspace;
        ctrl.refreshed = false;
        ctrl.filter = {
            fieldOptions: [
                {id: 'ID', name: 'ID'},
                {id: 'NAME', name: 'Name'},
                {id: 'ROUTING_TYPES', name: 'Queue Count'},
                {id: 'QUEUE_COUNT', name: 'User'}
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
                name: 'attributes',
                title: 'Navigate to attributes',
                actionFn: navigateToAddressAtts
            },
            {
               name: 'operations',
               title: 'navigate to operations',
               actionFn: navigateToAddressOps
            }
        ];
        ctrl.tableConfig = {
            selectionMatchProp: 'id',
            showCheckboxes: false
        };
        ctrl.tableColumns = [
            { header: 'ID', itemField: 'id' },
            { header: 'Name', itemField: 'name' },
            { header: 'Routing Types', itemField: 'routingTypes' },
            { header: 'Queue Count', itemField: 'queueCount' , templateFn: function(value, item) { return '<a href="#" onclick="selectQueues(\'' + item.name + '\')">' + value + '</a>' }}
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
            artemisAddress.address = null;
            ctrl.pagination.load();
        };

        if (artemisAddress.address) {
            Artemis.log.info("navigating to address = " + artemisAddress.address.address);
            ctrl.filter.values.field = ctrl.filter.fieldOptions[1].id;
            ctrl.filter.values.operation = ctrl.filter.operationOptions[0].id;
            ctrl.filter.values.value = artemisAddress.address.address;
        }

        selectQueues = function (address) {
            Artemis.log.info("navigating to queues:" + address)
            artemisAddress.address = { address: address };
            $location.path("artemis/artemisQueues");
        };

        function navigateToAddressAtts(action, item) {
            $location.path("artemis/attributes").search({"tab": "artemis", "nid": getAddressNid(item.name, $location)});
        };
        function navigateToAddressOps(action, item) {
            $location.path("artemis/operations").search({"tab": "artemis", "nid": getAddressNid(item.name, $location)});
        };
        function getAddressNid(address, $location) {
            var rootNID = getRootNid($location);
            var targetNID = rootNID + "addresses-" + address;
            Artemis.log.info("targetNID=" + targetNID);
            return targetNID;
        }
        function getRootNid($location) {
            var currentNid = $location.search()['nid'];
            Artemis.log.info("current nid=" + currentNid);
            var firstDash = currentNid.indexOf('-');
            var secondDash = currentNid.indexOf('-', firstDash + 1);
            var thirdDash = currentNid.indexOf('-', secondDash + 1);
            if (thirdDash < 0) {
                return currentNid + "-";
            }
            var rootNID = currentNid.substring(0, thirdDash + 1);
            return rootNID;
        }
        ctrl.loadOperation = function () {
            if (mbean) {
                var method = 'listAddresses(java.lang.String, int, int)';
                var addressFilter = {
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
                jolokia.request({ type: 'exec', mbean: mbean, operation: method, arguments: [JSON.stringify(addressFilter), ctrl.pagination.pageNumber, ctrl.pagination.pageSize] }, Core.onSuccess(populateTable, { error: onError }));
            }
        };

        ctrl.pagination.setOperation(ctrl.loadOperation);

        function onError(response) {
            Core.notification("error", "could not invoke list sessions" + response.error);
            $scope.workspace.selectParentNode();
        };

        function populateTable(response) {
            var data = JSON.parse(response.value);
            ctrl.addresses = [];
            angular.forEach(data["data"], function (value, idx) {
                ctrl.addresses.push(value);
            });
            ctrl.pagination.page(data["count"]);
            allAddresses = ctrl.addresses;
            ctrl.addresses = allAddresses;
            Core.$apply($scope);
        }

        ctrl.pagination.load();
    }
    AddressesController.$inject = ['$scope', 'workspace', 'jolokia', 'localStorage', 'artemisMessage', '$location', '$timeout', '$filter', 'pagination', 'artemisAddress'];


})(Artemis || (Artemis = {}));