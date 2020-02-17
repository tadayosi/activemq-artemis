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
/**
 * The main entry point for the Simple module
 */
 /// <reference path="tree/tree.module.js"/>
var Artemis = (function (Artemis) {

    /**
    * The name of this plugin
    */
    Artemis.pluginName = 'artemis-plugin';

    /**
    * This plugin's logger instance
    */
    Artemis.log = Logger.get('artemis-plugin');

    /**
    * The top level path of this plugin on the server
    */
    Artemis.contextPath = "/artemis-plugin/";

    Artemis._module = angular.module(Artemis.pluginName, [
        'angularResizable',
        'hawtio-artemis-tree',
        'artemis-navigation',
        'create-address',
        'delete-address',
        'create-queue',
        'artemis-delete-queue',
        'artemis-send-message',
        'artemis-browse-queue',
        'artemis-broker-diagram',
        'artemis-status'
    ])
    .config(configureRoutes)
    .controller("Artemis.PreferencesController", ["$scope", "localStorage", "userDetails", "$rootScope", function ($scope, localStorage, userDetails, $rootScope) {
         Core.initPreferenceScope($scope, localStorage, {
            'artemisUserName': {
                'value': userDetails.username ? userDetails.username : ""
            },
            'artemisPassword': {
               'value': userDetails.password ? userDetails.password : ""
            },
            'artemisDLQ': {
               'value': "DLQ"
            },
            'artemisExpiryQueue': {
               'value': "ExpiryQueue"
            }
        })}])
    .run(configureHelp)
    .run(configurePreferences)
   // .run(configureLayout)
   // .run(initPlugin)
    .component('artemis', Artemis.artemisComponent)
    .run(configurePlugin);

     Artemis._module.factory('artemisMessage', function () {
        return { 'message': null };
     });

    /**
    * Here we define the route for our plugin. One note is
    * to avoid using 'otherwise', as Hawtio has a handler
    * in place when a route doesn't match any routes that
    * routeProvider has been configured with.
    */
    function configureRoutes($routeProvider) {
       $routeProvider.
        when('/artemis/attributes', { templateUrl: 'plugins/jmx/html/attributes/attributes.html' }).
        when('/artemis/operations', { template: '<operations></operations>' }).
        when('/artemis/charts', { templateUrl: 'plugins/jmx/html/charts.html' }).
        when('/artemis/charts/edit', { templateUrl: 'plugins/jmx/html/chartEdit.html' }).
        when('/artemis/createAddress', { template: '<create-address></create-address>'}).
        when('/artemis/deleteAddress', { template: '<delete-address></delete-address>'}).
        when('/artemis/createQueue', { template: '<create-queue></create-queue>'}).
        when('/artemis/deleteQueue', { template: '<artemis-delete-queue></artemis-delete-queue>'}).
        when('/artemis/sendMessage', { template: '<artemis-send-message></artemis-send-message>'}).
        when('/artemis/browseQueue', { template: '<artemis-browse-queue></artemis-browse-queue>'}).
        when('/artemis/brokerDiagram', { template: '<artemis-broker-diagram></artemis-broker-diagram>'}).
        when('/artemis/artemisStatus', { template: '<artemis-status></artemis-status>'});
        Artemis.log.info("loaded routes")
    }
    configureRoutes.$inject = ['$routeProvider'];

    function configureHelp(helpRegistry, $templateCache) {
        var path = 'plugin/help.md';
        helpRegistry.addUserDoc('artemis', path);
        $templateCache.put(path, Artemis.ArtemisHelpTemplate);
    }
    configureHelp.$inject = ['helpRegistry', '$templateCache'];

    function configurePreferences(preferencesRegistry, $templateCache, workspace) {
        var path = 'plugin/preferences.html';
        preferencesRegistry.addTab("Artemis", path, function () {
            return workspace.treeContainsDomainAndProperties("org.apache.activemq.artemis");
        });
        $templateCache.put(path, Artemis.ArtemisPreferencesTemplate);
    }
    configurePreferences.$inject = ['preferencesRegistry', '$templateCache', 'workspace'];

  function configurePlugin(mainNavService, workspace, helpRegistry, preferencesRegistry, localStorage, preLogoutTasks, documentBase, $templateCache) {
    mainNavService.addItem({
        title: 'Artemis',
        basePath: '/artemis',
        template: '<artemis></artemis>',
        isValid: function () { return true; }
    });
    // clean up local storage upon logout
    preLogoutTasks.addTask('CleanupArtemisCredentials', function () {
        Artemis.log.debug("Clean up Artemis credentials in local storage");
        localStorage.removeItem('artemisUserName');
        localStorage.removeItem('artemisPassword');
    });
    }

    configurePlugin.$inject = ['mainNavService', 'workspace', 'helpRegistry', 'preferencesRegistry', 'localStorage', 'preLogoutTasks', 'documentBase', '$templateCache'];

  return Artemis;

})(Artemis || {});

// tell the Hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of AngularJS
hawtioPluginLoader.addModule(Artemis.pluginName);
