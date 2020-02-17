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
    Artemis.log.info("loading navigation");
    var TAB_CONFIG = {
        attributes: {
            title: 'Attributes',
            route: '/artemis/attributes'
        },
        operations: {
            title: 'Operations',
            route: '/artemis/operations'
        },
        chart: {
            title: 'Chart',
            route: '/artemis/charts'
        },
        createAddress: {
            title: 'Create address',
            route: '/artemis/createAddress'
        },
        deleteAddress: {
            title: 'Delete address',
            route: '/artemis/deleteAddress'
        },
        createQueue: {
            title: 'Create queue',
            route: '/artemis/createQueue'
        },
        deleteQueue: {
            title: 'Delete queue',
            route: '/artemis/deleteQueue'
        },
        sendMessage: {
            title: 'Send message',
            route: '/artemis/sendMessage'
        },
        browseQueue: {
            title: 'Browse queue',
            route: '/artemis/browseQueue'
        },
        brokerDiagram: {
            title: 'Broker diagram',
            route: '/artemis/brokerDiagram'
        },
        artemisStatus: {
            title: 'Broker status',
            route: '/artemis/artemisStatus'
        }
    };
    Artemis.navigationModule = angular
    .module('artemis-navigation', [])
    .component('artemisNavigation', {
        template: `<hawtio-tabs tabs="$ctrl.tabs" on-change="$ctrl.goto(tab)"></hawtio-tabs>`,
        controller: ArtemisNavigationController
    })
    .name;
    Artemis.log.info("loaded navigation " + Artemis.navigationModule);

    function ArtemisNavigationController($scope, $location, workspace, localStorage) {
        'ngInject';
        var _this = this;
        this.$location = $location;
        artemisJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";

        $scope.$on('jmxTreeClicked', function () {
            _this.tabs = getTabs();
            var tab = _.find(_this.tabs, { path: _this.$location.path() });
            if (!tab) {
                tab = _this.tabs[0];
            }
            _this.$location.path(tab.path);
        });

        ArtemisNavigationController.prototype.$onInit = function () {
            this.tabs = getTabs();
        };

        ArtemisNavigationController.prototype.goto = function (tab) {
            this.$location.path(tab.path);
        };

        function getTabs() {
            var tabs = [];
            var enabledRoutes = Object.keys(TAB_CONFIG)
                .map(function (config) { return TAB_CONFIG[config].route; })
                .filter(function (route) { return _.startsWith(route, '/artemis'); });
            if (enabledRoutes.length > 0) {
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.artemisStatus.title, TAB_CONFIG.artemisStatus.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.attributes.title, TAB_CONFIG.attributes.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.operations.title, TAB_CONFIG.operations.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.chart.title, TAB_CONFIG.chart.route));
                if (shouldShowCreateAddressTab()) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.createAddress.title, TAB_CONFIG.createAddress.route));
                }
                if (shouldShowDeleteAddressTab()) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.deleteAddress.title, TAB_CONFIG.deleteAddress.route));
                }
                if (shouldShowCreateQueueTab()) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.createQueue.title, TAB_CONFIG.createQueue.route));
                }
                if (shouldShowDeleteQueueTab()) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.deleteQueue.title, TAB_CONFIG.deleteQueue.route));
                }
                if (shouldShowDeleteQueueTab()) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.sendMessage.title, TAB_CONFIG.sendMessage.route));
                }
                if (shouldShowDeleteQueueTab()) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.browseQueue.title, TAB_CONFIG.browseQueue.route));
                }
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.brokerDiagram.title, TAB_CONFIG.brokerDiagram.route));
            }
            return tabs;
        }

        function shouldShowCreateAddressTab() {
            return workspace.selectionHasDomainAndLastFolderName(artemisJmxDomain, 'addresses');
        }

        function shouldShowDeleteAddressTab() {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'component': 'addresses'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'diverts'});
        }

        function shouldShowCreateQueueTab() {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'component': 'addresses'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'diverts'});
        }

        function shouldShowDeleteQueueTab() {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'});
        }
    }
    ArtemisNavigationController.$inject = ['$scope', '$location', 'workspace', 'localStorage']

})(Artemis || (Artemis = {}));
