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
    Artemis.artemisComponent = {
        template:
             `<div class="tree-nav-layout">
                  <div class="sidebar-pf sidebar-pf-left" resizable r-directions="['right']">
                    <artemis-tree-header></artemis-tree-header>
                    <artemis-tree></artemis-tree>
                  </div>
                  <div class="tree-nav-main">
                    <div>
                      <jmx-header></jmx-header>
                    </div>
                    <artemis-navigation></artemis-navigation>
                    <div class="contents" ng-view></div>
                  </div>
             </div>
            `
    };

    Artemis.ArtemisPreferencesTemplate =
         `<form class="form-horizontal artemis-preferences-form" ng-controller="Artemis.PreferencesController">
              <div class="form-group">
                <label class="col-md-2 control-label" for="artemisUserName">
                  Artemis user name
                  <span class="pficon pficon-info" data-toggle="tooltip" data-placement="top" title="The user name to be used when connecting to the broker"></span>
                </label>
                <div class="col-md-6">
                  <input id="artemisUserName" type="text" class="form-control" ng-model="artemisUserName"/>
                </div>
              </div>

              <div class="form-group">
                <label class="col-md-2 control-label" for="artemisPassword">
                  Artemis password
                  <span class="pficon pficon-info" data-toggle="tooltip" data-placement="top" title="The user name to be used when connecting to the broker"></span>
                </label>
                <div class="col-md-6">
                  <input id="artemisPassword" type="password" class="form-control" ng-model="artemisPassword"/>
                </div>
              </div>

              <div class="form-group">
                <label class="col-md-2 control-label" for="artemisDLQ">
                  The DLQ of the Broker
                  <span class="pficon pficon-info" data-toggle="tooltip" data-placement="top" title="The Dead Letter Queue of the Broker"></span>
                </label>
                <div class="col-md-6">
                  <input type="text" id="artemisDLQ" ng-model="artemisDLQ">
                </div>
              </div>

              <div class="form-group">
                <label class="col-md-2 control-label" for="artemisExpiryQueue">
                  The Expiry of the Broker
                  <span class="pficon pficon-info" data-toggle="tooltip" data-placement="top" title="The Expiry Queue of the Broker"></span>
                </label>
                <div class="col-md-6">
                  <input type="text" id="artemisExpiryQueue" ng-model="artemisExpiryQueue">
                </div>
              </div>
        </form>`;
    /*
    * This has to be indented far left so it renders correctly in the help menu
    */
    Artemis.ArtemisHelpTemplate =
        `
### Artemis

Click [Artemis](#/jmx/attributes?tab=artemis) in the top navigation bar to see the Artemis specific plugin. (The Artemis tab won't appear if there is no broker in this JVM).  The Artemis plugin works very much the same as the JMX plugin however with a focus on interacting with an Artemis broker.

The tree view on the left-hand side shows the top level JMX tree of each broker instance running in the JVM.  Expanding the tree will show the various MBeans registered by Artemis that you can inspect via the **Attributes** tab.

#### Creating a new Address

To create a new address simply click on the broker or the address folder in the jmx tree and click on the create tab.

Once you have created an address you should be able to **Send** to it by clicking on it in the jmx tree and clicking on the send tab.

#### Creating a new Queue

To create a new queue click on the address you want to bind the queue to and click on the create tab.

Once you have created a queue you should be able to **Send** a message to it or **Browse** it or view the  **Attributes** or **Charts**. Simply click on the queue in th ejmx tree and click on the appropriate tab.

You can also see a graphical view of all brokers, addresses, queues and their consumers using the **Diagram** tab.
            `;

})(Artemis || (Artemis = {}));