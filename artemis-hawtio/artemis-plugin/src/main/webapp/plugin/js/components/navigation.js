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
    Artemis.log.debug("loading navigation");
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
            route: '/artemis/artemisCreateAddress'
        },
        deleteAddress: {
            title: 'Delete address',
            route: '/artemis/artemisDeleteAddress'
        },
        createQueue: {
            title: 'Create queue',
            route: '/artemis/artemisCreateQueue'
        },
        deleteQueue: {
            title: 'Delete queue',
            route: '/artemis/artemisDeleteQueue'
        },
        sendMessage: {
            title: 'Send message',
            route: '/artemis/artemisSendMessage'
        },
        addressSendMessage: {
            title: 'Send message',
            route: '/artemis/artemisAddressSendMessage'
        },
        browseQueue: {
            title: 'Browse queue',
            route: '/artemis/artemisBrowseQueue'
        },
        brokerDiagram: {
            title: 'Broker diagram',
            route: '/artemis/artemisBrokerDiagram'
        },
        artemisStatus: {
            title: 'Status',
            route: '/artemis/artemisStatus'
        },
        artemisConnections: {
            title: 'Connections',
            route: '/artemis/artemisConnections'
        },
        artemisSessions: {
            title: 'Sessions',
            route: '/artemis/artemisSessions'
        },
        artemisConsumers: {
            title: 'Consumers',
            route: '/artemis/artemisConsumers'
        },
        artemisProducers: {
            title: 'Producers',
            route: '/artemis/artemisProducers'
        },
        artemisAddresses: {
            title: 'Addresses',
            route: '/artemis/artemisAddresses'
        },
        artemisQueues: {
            title: 'Queues',
            route: '/artemis/artemisQueues'
        }
    };
    Artemis._module
    .config(configureRoutes)
    .component('artemisNavigation', {
        template: `<hawtio-tabs tabs="$ctrl.tabs" on-change="$ctrl.goto(tab)"></hawtio-tabs>`,
        controller: ArtemisNavigationController
    })
    .name;
    Artemis.log.debug("loaded navigation " + Artemis.navigationModule);

    function ArtemisNavigationController($scope, $location, workspace, localStorage, jolokia) {
        'ngInject';
        var ctrl = this;
        this.$location = $location;
        artemisJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";

        $scope.$on('jmxTreeClicked', function () {
            ctrl.tabs = getTabs();
            var tab = _.find(ctrl.tabs, { path: ctrl.$location.path() });
            if (!tab) {
                tab = ctrl.tabs[0];
            }
            ctrl.$location.path(tab.path);
        });

        ArtemisNavigationController.prototype.$onInit = function () {
            this.tabs = getTabs();
        };

        ArtemisNavigationController.prototype.goto = function (tab) {
            this.$location.path(tab.path);
        };

        ctrl.showCreateAddress = workspace.hasInvokeRights({ mbean: Artemis.getBrokerMBean(workspace, jolokia) }, 'createAddress');
        ctrl.showDeleteAddress = workspace.hasInvokeRights({ mbean: Artemis.getBrokerMBean(workspace, jolokia) }, 'deleteAddress');
        ctrl.showCreateQueue = workspace.hasInvokeRights({ mbean: Artemis.getBrokerMBean(workspace, jolokia) }, 'createQueue');
        ctrl.showDeleteQueue = workspace.hasInvokeRights({ mbean: Artemis.getBrokerMBean(workspace, jolokia) }, 'destroyQueue');

        function getTabs() {

            var tabs = [];
            var enabledRoutes = Object.keys(TAB_CONFIG)
                .map(function (config) { return TAB_CONFIG[config].route; })
                .filter(function (route) { return _.startsWith(route, '/artemis'); });
            if (enabledRoutes.length > 0) {
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.artemisStatus.title, TAB_CONFIG.artemisStatus.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.artemisConnections.title, TAB_CONFIG.artemisConnections.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.artemisSessions.title, TAB_CONFIG.artemisSessions.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.artemisConsumers.title, TAB_CONFIG.artemisConsumers.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.artemisProducers.title, TAB_CONFIG.artemisProducers.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.artemisAddresses.title, TAB_CONFIG.artemisAddresses.route));
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.artemisQueues.title, TAB_CONFIG.artemisQueues.route));
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
                if (shouldShowSendMessageTab(workspace)) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.sendMessage.title, TAB_CONFIG.sendMessage.route));
                }
                if (shouldShowAddressSendMessageTab(workspace)) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.addressSendMessage.title, TAB_CONFIG.addressSendMessage.route));
                }
                if (shouldShowBrowseMessageTab(workspace)) {
                    tabs.push(new Nav.HawtioTab(TAB_CONFIG.browseQueue.title, TAB_CONFIG.browseQueue.route));
                }
                tabs.push(new Nav.HawtioTab(TAB_CONFIG.brokerDiagram.title, TAB_CONFIG.brokerDiagram.route));
            }
            return tabs;
        }

        function shouldShowCreateAddressTab() {
            return workspace.selectionHasDomainAndLastFolderName(artemisJmxDomain, 'addresses') && ctrl.showCreateAddress;
        }

        function shouldShowDeleteAddressTab() {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'component': 'addresses'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'diverts'}) && ctrl.showDeleteAddress;
        }

        function shouldShowCreateQueueTab() {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'component': 'addresses'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'diverts'}) && ctrl.showCreateQueue;
        }

        function shouldShowDeleteQueueTab() {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'}) && ctrl.showDeleteQueue;
        }

        function shouldShowSendMessageTab(workspace) {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'}) && hasQueueinvokeRights(workspace, "sendMessage");
        }

        function shouldShowAddressSendMessageTab(workspace) {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'component': 'addresses'}) && !workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'}) && hasQueueinvokeRights(workspace, "sendMessage");
        }

        function shouldShowBrowseMessageTab(workspace) {
            return workspace.hasDomainAndProperties(artemisJmxDomain, {'subcomponent': 'queues'}) && hasQueueinvokeRights(workspace, "browse") && hasQueueinvokeRights(workspace, "countMessages");
        }

        /*
        function hasInvokeRights(jolokia, mbean, operation) {
            var response = jolokia.request({
                type: 'exec',
                mbean: 'hawtio:type=security,area=jmx,name=ArtemisJMXSecurity',
                operation: 'canInvoke(java.lang.String, java.lang.String)',
                arguments: [mbean, operation] },
                Core.onSuccess(null));

            Artemis.log.debug(operation + "=" + response.value);
            return response.value;
        }
        */
        function hasQueueinvokeRights(workspace, operation) {
            var selection = workspace.selection;
            if (!selection)
                return false;
            var mbean = selection.objectName;
            if (!mbean)
                return false;
            return workspace.hasInvokeRights(workspace.selection, operation);
        }
    }
    ArtemisNavigationController.$inject = ['$scope', '$location', 'workspace', 'localStorage', 'jolokia']

    function configureRoutes($routeProvider) {
       $routeProvider.
        when('/artemis/attributes', { templateUrl: 'plugins/jmx/html/attributes/attributes.html' }).
        when('/artemis/operations', { template: '<operations></operations>' }).
        when('/artemis/charts', { templateUrl: 'plugins/jmx/html/charts.html' }).
        when('/artemis/charts/edit', { templateUrl: 'plugins/jmx/html/chartEdit.html' }).
        when('/artemis/artemisCreateAddress', { template: '<artemis-create-address></artemis-create-address>'}).
        when('/artemis/artemisDeleteAddress', { template: '<artemis-delete-address></artemis-delete-address>'}).
        when('/artemis/artemisCreateQueue', { template: '<artemis-create-queue></artemis-create-queue>'}).
        when('/artemis/artemisDeleteQueue', { template: '<artemis-delete-queue></artemis-delete-queue>'}).
        when('/artemis/artemisSendMessage', { template: '<artemis-send-message></artemis-send-message>'}).
        when('/artemis/artemisAddressSendMessage', { template: '<artemis-address-send-message></artemis-address-send-message>'}).
        when('/artemis/artemisBrowseQueue', { template: '<artemis-browse-queue></artemis-browse-queue>'}).
        when('/artemis/artemisBrokerDiagram', { template: '<artemis-broker-diagram></artemis-broker-diagram>'}).
        when('/artemis/artemisStatus', { template: '<artemis-status></artemis-status>'}).
        when('/artemis/artemisConnections', { template: '<artemis-connections></artemis-connections>'}).
        when('/artemis/artemisSessions', { template: '<artemis-sessions></artemis-sessions>'}).
        when('/artemis/artemisConsumers', { template: '<artemis-consumers></artemis-consumers>'}).
        when('/artemis/artemisProducers', { template: '<artemis-producers></artemis-producers>'}).
        when('/artemis/artemisAddresses', { template: '<artemis-addresses></artemis-addresses>'}).
        when('/artemis/artemisQueues', { template: '<artemis-queues></artemis-queues>'});
    }
    configureRoutes.$inject = ['$routeProvider'];

})(Artemis || (Artemis = {}));
