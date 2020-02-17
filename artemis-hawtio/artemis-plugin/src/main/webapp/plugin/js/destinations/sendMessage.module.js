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
    Artemis.log.info("loading send message");
    Artemis.createQueueModule = angular
    .module('artemis-send-message', [])
    .component('artemisSendMessage', {
        template:
            `<h2>Send Message</h2>

               <div class="alert alert-warning" ng-show="$ctrl.noCredentials">
                 <span class="pficon pficon-warning-triangle-o"></span>
                 <strong>No credentials set for endpoint!</strong>
                 Please set your username and password in the
                 <a href="#" class="alert-link" ng-click="$ctrl.openPrefs()">Preferences</a> page.
               </div

               <div class="row artemis-message-configuration">

                <div class="col-sm-12">
                  <form>
                    <div class="form-group">
                      <label>Durable </label>
                      <input id="durable" type="checkbox" ng-model="$ctrl.durable" value="true">
                    </div>
                  </form>
                </div>
              </div>

               <h3>Headers</h3>

               <div class="row artemis-message-headers" ng-if="$ctrl.headers.length > 0">
                 <div class="col-sm-5">
                   <form>
                     <div class="form-group">
                       <label>Name</label>
                       <input type="text" class="form-control" ng-model="header.name" ng-repeat="header in $ctrl.headers"
                              uib-typeahead="completion for completion in defaultHeaderNames() | filter:$viewValue"
                              pf-focused="$last">
                     </div>
                   </form>
                 </div>
                 <div class="col-sm-5">
                   <form>
                     <div class="form-group">
                       <label>Value</label>
                       <input type="text" class="form-control" ng-model="header.value" ng-repeat="header in $ctrl.headers">
                     </div>
                   </form>
                 </div>
                 <div class="col-sm-2">
                   <form>
                     <div class="form-group">
                       <label>&nbsp;</label>
                       <button type="button" class="btn btn-default" title="Delete" ng-click="$ctrl.removeHeader(header)"
                               ng-repeat="header in $ctrl.headers">
                         <span class="pficon pficon-delete"></span>
                       </button>
                     </div>
                   </form>
                 </div>
               </div>

               <p>
                 <button type="button" class="btn btn-primary artemis-add-message-button" ng-click="$ctrl.addHeader()">Add Header</button>
               </p>

               <h3>Body</h3>

               <form>
                 <div class="form-group">
                   <div hawtio-editor="$ctrl.message" mode="codeMirrorOptions.mode.name"></div>
                 </div>
                 <div class="form-group">
                   <select class="form-control artemis-send-message-format" ng-model="codeMirrorOptions.mode.name">
                     <option value="javascript">JSON</option>
                     <option value="xml">XML</option>
                   </select>
                   <button class="btn btn-default" ng-click="$ctrl.formatMessage()"
                           title="Automatically pretty prints the message so its easier to read">Format
                   </button>
                 </div>
               </form>

               <p>
                 <button type="button" class="btn btn-primary artemis-send-message-button" ng-click="$ctrl.sendMessage($ctrl.durable)">Send message</button>
               </p>
        `,
        controller: SendMessageController
    })
    .name;
    Artemis.log.info("loaded queue " + Artemis.createQueueModule);

    function SendMessageController($route, $scope, $element, $timeout, workspace,  jolokia, localStorage, $location, artemisMessage) {
        Core.initPreferenceScope($scope, localStorage, {
            'durable': {
                'value': true,
                'converter': Core.parseBooleanValue
            }
        });
        var ctrl = this;
        ctrl.noCredentials = false;
        ctrl.durable = true;
        ctrl.message = "";
        ctrl.headers = [];
        // bind model values to search params...
        Core.bindModelToSearchParam($scope, $location, "tab", "subtab", "compose");
        Core.bindModelToSearchParam($scope, $location, "searchText", "q", "");
        // only reload the page if certain search parameters change
        Core.reloadWhenParametersChange($route, $scope, $location);
        ctrl.checkCredentials = function () {
            ctrl.noCredentials = (Core.isBlank(localStorage['artemisUserName']) || Core.isBlank(localStorage['artemisPassword']));
        };
        if ($location.path().indexOf('artemis') > -1) {
            ctrl.localStorage = localStorage;
            $scope.$watch('localStorage.artemisUserName', ctrl.checkCredentials);
            $scope.$watch('localStorage.artemisPassword', ctrl.checkCredentials);
            //prefill if it's a resent
            if (artemisMessage.message !== null) {
                ctrl.message = artemisMessage.message.bodyText;
                if (artemisMessage.message.PropertiesText !== null) {
                    for (var p in artemisMessage.message.StringProperties) {
                        ctrl.headers.push({name: p, value: artemisMessage.message.StringProperties[p]});
                    }
                }
            }
            // always reset at the end
            artemisMessage.message = null;
        }

        this.openPrefs = function () {
            Artemis.log.info("opening prefs");
            $location.path('/preferences').search({'pref': 'Artemis'});
        }

        var LANGUAGE_FORMAT_PREFERENCE = "defaultLanguageFormat";
        var sourceFormat = workspace.getLocalStorage(LANGUAGE_FORMAT_PREFERENCE) || "javascript";

        $scope.codeMirrorOptions = CodeEditor.createEditorSettings({
            mode: {
                name: sourceFormat
            }
        });

        $scope.$on('hawtioEditor_default_instance', function (event, codeMirror) {
            $scope.codeMirror = codeMirror;
        });

        ctrl.addHeader = function  () {
            ctrl.headers.push({name: "", value: ""});
            // lets set the focus to the last header
            if ($element) {
                $timeout(function () {
                    var lastHeader = $element.find("input.headerName").last();
                    lastHeader.focus();
                }, 100);
            }
        }

        this.removeHeader = function (header) {
            var index = ctrl.headers.indexOf(header);
            $scope.headers.splice(index, 1);
        };

        ctrl.defaultHeaderNames = function () {
            var answer = [];

            function addHeaderSchema(schema) {
                angular.forEach(schema.definitions.headers.properties, function (value, name) {
                    answer.push(name);
                });
            }

            addHeaderSchema(Artemis.jmsHeaderSchema);
            return answer;
        };

        function operationSuccess() {
            Core.notification("success", "Message sent!");
            ctrl.headers = [];
            ctrl.message = "";
        };

        function onError(response) {
           Core.notification("error", "Could not send message: " + response.error);
        }

        ctrl.formatMessage = function () {
            CodeEditor.autoFormatEditor($scope.codeMirror);
        };
        ctrl.sendMessage = function (durable) {
            var body = ctrl.message;
            Artemis.log.info(body);
            doSendMessage(ctrl.durable, body);
        };

        function doSendMessage(durable, body) {
            var selection = workspace.selection;
            if (selection) {
                var mbean = selection.objectName;
                if (mbean) {
                    var headers = null;
                    if (ctrl.headers.length) {
                        headers = {};
                        angular.forEach(ctrl.headers, function (object) {
                            var key = object.name;
                            if (key) {
                                headers[key] = object.value;
                            }
                        });
                        Artemis.log.debug("About to send headers: " + JSON.stringify(headers));
                    }

                    var user = ctrl.localStorage["artemisUserName"];
                    var pwd = ctrl.localStorage["artemisPassword"];

                    if (!headers) {
                        headers = {};
                    }
                    var type = 3;
                    Artemis.log.debug(headers);
                    Artemis.log.debug(type);
                    Artemis.log.debug(body);
                    Artemis.log.debug(durable);
                    jolokia.execute(mbean, "sendMessage(java.util.Map, int, java.lang.String, boolean, java.lang.String, java.lang.String)", headers, type, body, durable, user, pwd,  Core.onSuccess(operationSuccess, { error: onError }));
                }
            }
        }
    }
    SendMessageController.$inject = ['$route', '$scope', '$element', '$timeout', 'workspace', 'jolokia', 'localStorage', '$location', 'artemisMessage'];

})(Artemis || (Artemis = {}));
