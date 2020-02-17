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
    Artemis._module.run(configureToolbar);

       function configureToolbar($templateCache) {
           $templateCache.put('plugin/artemistoolbar.html',
                `
                <div class="row toolbar-pf table-view-pf-toolbar" id="toolbar1">
                    <form class="toolbar-pf-actions">
                          <div class="form-group toolbar-pf-filter">
                             <div class="input-group">
                                 &nbsp;
                                 <label>Filter:</label>
                                 &nbsp;
                                 <select ng-model="$ctrl.filter.values.field" id="filter.values.field">
                                     <option ng-repeat="option in $ctrl.filter.fieldOptions" value="{{option.id}}">{{option.name}}</option>
                                 </select>
                                 <select ng-model="$ctrl.filter.values.operation" id="filter.values.operation">
                                     <option ng-repeat="option in $ctrl.filter.operationOptions" value="{{option.id}}">{{option.name}}
                                     </option>
                                 </select>
                                 <input type="text" ng-model="$ctrl.filter.values.value" placeholder="Value">
                                 &nbsp;
                                 <label>Sort:</label>
                                 &nbsp;
                                 <select ng-model="$ctrl.filter.values.sortOrder" id="filter.values.sortOrder">
                                    <option ng-repeat="option in $ctrl.filter.sortOptions" value="{{option.id}}">{{option.name}}
                                    </option>
                                 </select>
                                 <select ng-model="$ctrl.filter.values.sortColumn" id="filter.values.sortColumn">
                                    <option ng-repeat="option in $ctrl.tableColumns" value="{{option.itemField}}">{{option.header}}
                                    </option>
                                 </select>
                                 <button class="btn btn-link btn-find" ng-click="$ctrl.refresh()" type="button">
                                     <span class="fa fa-search"></span>
                                 </button>
                                 &nbsp;&nbsp;
                                 <button class="btn pull-right" ng-click="$ctrl.reset()"
                                         title="Reset">
                                     <i class="icon-refresh">&nbsp;&nbsp;Reset</i>
                                 </button>
                             </div>
                          </div>
                    </form>
                 </div>
               `
           )
       }
       configureToolbar.$inject = ['$templateCache'];

})(Artemis || (Artemis = {}));