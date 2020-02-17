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
    Artemis.log.info("loading address");
    Artemis.addressModule = angular
    .module('create-address', [])
    .component('createAddress', {
        template:
            `<form class="form-horizontal">

                 <div class="form-group">
                     <label class="col-sm-2 control-label" for="name-markup">Address name</label>

                     <div class="col-sm-10">
                         <input id="name-markup" class="form-control" type="text" maxlength="300"
                                name="addressName" ng-model="$ctrl.addressName" placeholder="Address name"/>
                     </div>
                 </div>
                 <div class="form-group">
                     <label class="col-sm-2 control-label">Routing type</label>

                     <div class="col-sm-10">
                         <label class="checkbox">
                             <input type="radio" ng-model="$ctrl.routingType" value="Multicast"> Multicast
                         </label>
                         <label class="checkbox">
                             <input type="radio" ng-model="$ctrl.routingType" value="Anycast"> Anycast
                         </label>
                         <label class="checkbox">
                             <input type="radio" ng-model="$ctrl.routingType" value="Both"> Both
                         </label>
                     </div>
                 </div>

                 <div class="form-group">
                     <div class="col-sm-offset-2 col-sm-10">
                         <button type="submit" class="btn btn-primary"
                                 ng-click="$ctrl.createAddress($ctrl.addressName, $ctrl.routingType)"
                                 ng-disabled="!$ctrl.addressName">Create Address
                         </button>
                     </div>
                 </div>

                 <div hawtio-confirm-dialog="$ctrl.createDialog"
                      ok-button-text="Create"
                      cancel-button-text="Cancel"
                      on-ok="$ctrl.createAddress($ctrl.addressName, $ctrl.routingType)">
                     <div class="dialog-body">
                         <p>Address name <b>{{$ctrl.addressName}}</b> contains unrecommended characters: <code>:</code></p>
                         <p>This may cause unexpected problems. Are you really sure to create this {{$ctrl.uncapitalisedDestinationType()}}?</p>
                     </div>
                 </div>

             </form>
        `,
        controller: CreateAddressController
    })
    .name;
    Artemis.log.info("loaded address " + Artemis.addressModule);

    function CreateAddressController($scope, workspace, jolokia, localStorage) {
        Artemis.log.info("loaded address controller");
        var ctrl = this;
        ctrl.addressName = "";
        ctrl.routingType = "Anycast";
        ctrl.workspace = workspace;
        ctrl.message = "";

        $scope.$watch('workspace.selection', function () {
            workspace.moveIfViewInvalid();
        });

        function operationSuccess() {
            ctrl.addressName = "";
            ctrl.workspace.operationCounter += 1;
            Core.$apply($scope);
            Core.notification("success", $scope.message);
            ctrl.workspace.loadTree();
        }

        function onError(response) {
            Core.notification("error", "Could not create address: " + response.error);
        }

        ctrl.createAddress = function (name, routingType) {
            Artemis.log.info("creating " + routingType);
            var mbean = Artemis.getBrokerMBean(workspace, jolokia);
            if (mbean) {
                if (routingType == "Multicast") {
                    $scope.message = "Created  Multicast Address " + name;
                    Artemis.log.info(ctrl.message);
                    jolokia.execute(mbean, "createAddress(java.lang.String,java.lang.String)", name, "MULTICAST",  Core.onSuccess(operationSuccess, { error: onError }));
                }
                else if (routingType == "Anycast") {
                    $scope.message = "Created Anycast Address " + name;
                    Artemis.log.info(ctrl.message);
                    jolokia.execute(mbean, "createAddress(java.lang.String,java.lang.String)", name, "ANYCAST",  Core.onSuccess(operationSuccess, { error: onError }));
                }
                else {
                    $scope.message = "Created Anycast/Multicast Address " + name;
                    Artemis.log.info(ctrl.message);
                    jolokia.execute(mbean, "createAddress(java.lang.String,java.lang.String)", name, "ANYCAST,MULTICAST",  Core.onSuccess(operationSuccess, { error: onError }));
                }
            }
        };
    }
    CreateAddressController.$inject = ['$scope', 'workspace', 'jolokia', 'localStorage'];

})(Artemis || (Artemis = {}));
