function NodeManagementController($scope, $mdDialog) {
    var ctrl = this;
    var originatorEv;
    ctrl.openMenu = function($mdMenu, ev) {
        originatorEv = ev;
        $mdMenu.open(ev);
        console.log("Clicked");
    };
    ctrl.showDialog = function($event, templateUrl, selectedScript) {
        console.log("Clicked showDialog with event: " + $event);
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: templateUrl,
            locals: {
                selectedScript: selectedScript
            },
            controller: DialogController
        });
    }
}

function DialogController($rootScope, $scope, $mdDialog, nodeStoreService, nodeStoreStagedNodeTypesService, nodeStoreStagedNetworksService,
    nodeStoreStagedSimulationsService, nodeStoreStagedSelectedService, selectedScript) {
    var ctrl = this;
    $scope.nodeStoreStagedNodeTypesService = nodeStoreStagedNodeTypesService;
    $scope.nodeStoreStagedNetworksService = nodeStoreStagedNetworksService;
    $scope.nodeStoreStagedSimulationsService = nodeStoreStagedSimulationsService;
    $scope.nodeStoreStagedSelectedService = nodeStoreStagedSelectedService;
    ctrl._mdDialog = $mdDialog;
    $scope.selectedScript = selectedScript;
    $scope.nodeTypesCatalog = [];
    $scope.networksCatalog = [];
    $scope.simulationsCatalog = [];
    $scope.form = {
        loadFromRawNetsimSimulation: true,
        netsimRawData: '',
        netsimRawDataNodeNamePrefix: "",
        generatedScript: '',
        newNode: {
            node: {
                name: '',
                ip: ''
            },
            nodeType: {
                name: '',
                addNew: false,
                newName: ''
            },
            network: {
                id: '',
                name: '',
                addNew: false,
                newName: ''
            },
            simulation: {
                id: '',
                name: '',
                addNew: false,
                newName: ''
            }
        },
        deleteNodeData: {
            action: 'DELETE_SELECTED'
        }
    };
    ctrl.populateNodeTypesCatalog = function() {
        $scope.nodeTypesCatalog = nodeStoreStagedNodeTypesService.getNodeTypesCatalog();
        if ($scope.nodeTypesCatalog.length > 0) {
            $scope.form.newNode.nodeType.name = $scope.nodeTypesCatalog[0];
        }
    };
    ctrl.populateNetworksCatalogAndThenLoadSimulations = function() {
        $scope.networksCatalog = $scope.nodeStoreStagedNetworksService.getNetworksCatalog();
        if ($scope.networksCatalog.length > 0) {
            $scope.form.newNode.network.id = $scope.networksCatalog[0].id;
            console.log("Set default network to %s", $scope.form.newNode.network.id);
            ctrl.populateSimulationsCatalog();
        }
    };
    ctrl.populateSimulationsCatalog = function() {
        console.info("Loading simulations catalog. Currently selected network id: %s", $scope.form.newNode.network.id);
        $scope.simulationsCatalog = $scope.nodeStoreStagedSimulationsService.getSimulationsForNetworkId($scope.form.newNode.network.id);
        if ($scope.simulationsCatalog.length > 0) {
            $scope.form.newNode.simulation.id = $scope.simulationsCatalog[0].id;
            console.log("Set default simulation to: %s", $scope.form.newNode.simulation.id);
        }
    };
    ctrl.populateNetworksAndSimulations = function() {
        ctrl.populateNetworksCatalogAndThenLoadSimulations();
    };
    $scope.reloadSimulationsFromSelectedNetwork = function() {
        console.log("Reloading simulations...");
        ctrl.populateSimulationsCatalog();
    };
    ctrl.populateNodeTypesCatalog();
    ctrl.populateNetworksAndSimulations();
    var summaryOfSelectedLiveNetworkData = $scope.nodeStoreStagedSelectedService.getSummaryOfSelectedLiveNetworkData();
    $scope.selectedLiveNetworks = summaryOfSelectedLiveNetworkData.selectedLiveNetworks;
    $scope.selectedLiveSimulations = summaryOfSelectedLiveNetworkData.selectedLiveSimulations;
    $scope.selectedLiveNodes = summaryOfSelectedLiveNetworkData.selectedLiveNodes;
    $scope.selectedLiveNetworkData = $scope.nodeStoreStagedSelectedService.getSelectedLiveNetworkData();
    this.$onInit = function() {
        switch ($scope.selectedScript) {
            case 0:
                nodeStoreStagedSelectedService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForAddNodes(true));
                break;
            case 1:
                nodeStoreStagedSelectedService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForAddNodes(false));
                break;
            case 2:
                nodeStoreStagedSelectedService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForDeleteNodes);
                break;
            case 3:
                nodeStoreStagedSelectedService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForPmFunctionEnabled);
                break;
            case 4:
                nodeStoreStagedSelectedService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForPmFunctionDisabled);
                break;
            case 5:
                nodeStoreStagedSelectedService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForSetNodeIps);
                break;
            default:
                console.log("No option selected. Ignoring event.");
                break;
        }
    };
    $scope.handleNetworkAddNewSwitch = function() {
        if ($scope.form.newNode.network.addNew) {
            $scope.form.newNode.simulation.addNew = true;
        } else {
            $scope.form.newNode.simulation.addNew = false;
        }
    };
    $scope.handleSimulationAddNewSwitch = function() {
        if ($scope.form.newNode.network.addNew) {
            $scope.form.newNode.simulation.addNew = true;
        }
    };
    $scope.saveNodeData = function() {
        console.log("Clicked on saveNodeData");
        console.log($scope.form);
        if ($scope.form.loadFromRawNetsimSimulation) {
            ctrl.saveNodeDataFromRawNetsimSimulation();
        } else {
            ctrl.saveNodeDataFromManualInput();
        }
        $mdDialog.hide();
    };
    $scope.deleteNodeData = function() {
        console.log("Clicked on deleteNodeData");
        if ($scope.form.deleteNodeData.action === "DELETE_SELECTED") {
            nodeStoreService.deleteSelectedNetworkData();
        } else if ($scope.form.deleteNodeData.action === "DELETE_ALL") {
            nodeStoreService.deleteAllNetworkData();
        }
        $mdDialog.hide();
    };
    $scope.saveNetworkSnapshot = function() {
        nodeStoreService.updateDatabaseForLiveNetworkData();
        $mdDialog.hide();
    };
    $scope.cancelOrClose = function() {
        console.log("Clicked on cancelOrClose");
        console.log($scope.form);
        $mdDialog.hide();
    };
    $scope.copyToClipboard = function() {
        console.log("Clicked on copyToClipboard");
        alert("Not implemented!!!");
        console.log($scope.form);
        $mdDialog.hide();
    };
    $scope.download = function() {
        console.log("Clicked on download");
        var uri = 'data:text/plain;charset=utf-8,' + encodeURIComponent($scope.form.generatedScript);
        var link = document.createElement("a");
        link.href = uri;
        link.style = "visibility:hidden";
        link.download = "generated_script.txt";
        document.getElementById("hiddenDivForDownload").appendChild(link);
        link.click();
        document.getElementById("hiddenDivForDownload").removeChild(link);
        $mdDialog.hide();
    };

    ctrl.saveNodeDataFromRawNetsimSimulation = function() {
        console.log("Called saveNodeDataFromRawNetsimSimulation");
        var parsedNetworks = this.parseNetsimSimulationRawData();

        for (var parsedNetworksIndex = 0; parsedNetworksIndex < parsedNetworks.length; parsedNetworksIndex++) {
          var currentParsedNetwork = parsedNetworks[parsedNetworksIndex];
          for (var parsedSimulationsIndex = 0; parsedSimulationsIndex < currentParsedNetwork.simulations.length; parsedSimulationsIndex++) {
            var currentParsedSimulation = currentParsedNetwork.simulations[parsedSimulationsIndex];

            if (currentParsedSimulation.nodes.length > 0) {
              var nodesBatch = {
                  nodeType: $scope.form.newNode.nodeType,
                  network: $scope.form.newNode.network,
                  simulation: $scope.form.newNode.simulation,
                  newNodes: []
              };

//              if (currentParsedNetwork.name && currentParsedNetwork.name != 'NON_OVERRIDING_NETWORK') {
//                nodesBatch.overridingNetwork = {
//                  name: currentParsedNetwork.name
//                };
//              } else
              if (currentParsedNetwork.overridingNetworkName) {
                nodesBatch.overridingNetwork = {
                  name: currentParsedNetwork.overridingNetworkName
                };
              }

//              if (currentParsedSimulation.name && currentParsedSimulation.name != 'NON_OVERRIDING_SIMULATION') {
//                nodesBatch.overridingSimulation = {
//                  name: currentParsedSimulation.name
//                };
//              } else
                if (currentParsedSimulation.overridingSimulationName) {
                nodesBatch.overridingSimulation = {
                  name: currentParsedSimulation.overridingSimulationName
                };
              }

              for (var parsedNodeIndex = 0; parsedNodeIndex < currentParsedSimulation.nodes.length; parsedNodeIndex++) {
                  var parsedNode = currentParsedSimulation.nodes[parsedNodeIndex];
                  var newNode = {
                      node: {
                          name: parsedNode.name,
                          ip: parsedNode.ip
                      }
                  }
                  nodesBatch.newNodes.push(newNode);
              }

              nodeStoreService.addBatchOfNodes(nodesBatch);
            }
          }
        }
    };

    ctrl.parseNetsimSimulationRawData = function() {
        var parsedNetworks = [{
          name: 'NON_OVERRIDING_NETWORK',
          overridingNetworkName: undefined,
          simulations: [ {
            name: 'NON_OVERRIDING_SIMULATION',
            overridingSimulationName: undefined,
            nodes: []
            }
          ]
        }];

        var lines = $scope.form.netsimRawData.split("\n");
        var overridingNetworkName = 'NON_OVERRIDING_NETWORK';
        var overridingSimulationName = 'NON_OVERRIDING_SIMULATION';
        for (var i = 0; i < lines.length; i++) {
            var currentLine = lines[i];
            // Empty lines or lines starting with '#' are taken as comments and will be ignored
            if (currentLine.trim().length == 0 || currentLine.trim().startsWith('#')) {
                continue;
            }
            // Lines starting with 'networkName:' will override the name of the simulation entered in the UI
            if (currentLine.trim().startsWith('networkName:')) {
                overridingNetworkName = currentLine.substring(currentLine.indexOf("networkName:") + 12).trim();
                continue;
            }
            // Lines starting with 'simulationName:' will override the name of the simulation entered in the UI
            if (currentLine.trim().startsWith('simulationName:')) {
                overridingSimulationName = currentLine.substring(currentLine.indexOf("simulationName:") + 16).trim();
                continue;
            }
            if (currentLine != null && !/^\s*$/.test(currentLine)) {
                var nodeName = currentLine.match(new RegExp($scope.form.netsimRawDataNodeNamePrefix + "([a-zA-Z0-9]+)", "g"));
                var nodeIp = currentLine.match(
                    /((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}/g
                );
                if (nodeIp == null || nodeIp.length == 0) {
                    nodeIp = currentLine.match(
                        /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g
                    );
                }
                if (nodeName != null) nodeName = nodeName[0];
                if (nodeIp != null) nodeIp = nodeIp[0];

                var currentNetwork = parsedNetworks.find(function (networkElementInArray) {
                        var matchFound = false;

                        if (networkElementInArray.overridingNetworkName) {
                            matchFound = networkElementInArray.overridingNetworkName === overridingNetworkName;
                        } else {
                            matchFound = networkElementInArray.name === overridingNetworkName;
                        }

                        return matchFound;
                });

                if (!currentNetwork) {
                    currentNetwork = {
                        name: (overridingNetworkName != 'NON_OVERRIDING_NETWORK') ? undefined : overridingNetworkName,
                        overridingNetworkName: (overridingNetworkName != 'NON_OVERRIDING_NETWORK') ? overridingNetworkName : undefined,
                        simulations: [ {
                            name: (overridingSimulationName != 'NON_OVERRIDING_SIMULATION') ? undefined : overridingSimulationName,
                            overridingSimulationName: (overridingSimulationName != 'NON_OVERRIDING_SIMULATION') ? overridingSimulationName : undefined,
                            nodes: []
                          }
                        ]
                    };
                    parsedNetworks.push(currentNetwork);
                }

                var currentSimulation =
                    currentNetwork.simulations.find(
                      function (simulationNameInArray) {
                        var matchFound = false;

                        if (simulationNameInArray.overridingSimulationName) {
                            matchFound = simulationNameInArray.overridingSimulationName === overridingSimulationName;
                        } else {
                            matchFound = simulationNameInArray.name === overridingSimulationName;
                        }

                        return matchFound;
                       }
                     );
                if (!currentSimulation) {
                    currentSimulation = {
                      name: (overridingSimulationName != 'NON_OVERRIDING_SIMULATION') ? undefined : overridingSimulationName,
                      overridingSimulationName: (overridingSimulationName != 'NON_OVERRIDING_SIMULATION') ? overridingSimulationName : undefined,
                      nodes: []
                    }
                    currentNetwork.simulations.push(currentSimulation);
                }

                currentSimulation.nodes.push({
                  name: nodeName,
                  ip: nodeIp
                });
            }
        }
        return parsedNetworks;
    }
    ctrl.saveNodeDataFromManualInput = function() {
        console.log("Called saveNodeDataFromManualInput");
        var newNode = JSON.parse(JSON.stringify($scope.form.newNode));
        nodeStoreService.addSingleNode(newNode);
    };

    this.callbackGenerateScriptForAddNodes = function(pmFunctionEnable) {
        return function(callbackParams) {
            var currentNode = callbackParams.currentNode;
            var cmds = 'cmedit create NetworkElement=' + currentNode.name + ' networkElementId=' + currentNode.name + ', neType="' +
                currentNode.neType + '", ossPrefix="" -ns=OSS_NE_DEF -version=2.0.0\n' + String.fromCharCode(13);
            cmds += 'cmedit create NetworkElement=' + currentNode.name +
                ',ComConnectivityInformation=1 comConnectivityInformationId="1",transportProtocol="TLS",snmpVersion="SNMP_V3",snmpSecurityName="mediation",snmpSecurityLevel="NO_AUTH_NO_PRIV",ipAddress="' +
                currentNode.ip + '",port=6513 -namespace=COM_MED -version=1.1.0\n';
            cmds += 'secadm credentials create --secureusername netsim --secureuserpassword netsim --ldapuser disable -n ' + currentNode.name +
                '\n';
            cmds += 'cmedit set NetworkElement=' + currentNode.name + ',CmNodeHeartbeatSupervision=1 active=true\n';
            cmds += 'cmedit action NetworkElement=' + currentNode.name + ',CmFunction=1 sync\n';
            if (pmFunctionEnable) {
                cmds += 'cmedit set NetworkElement=' + currentNode.name + ',PmFunction=1 pmEnabled=true\n';
            }
            cmds += 'cmedit get NetworkElement=' + currentNode.name + ',CmFunction=1\n\n';
            $scope.form.generatedScript += cmds;
        };
    };
    this.callbackGenerateScriptForDeleteNodes = function(callbackParams) {
        var currentNode = callbackParams.currentNode;
        var pmFunctionEnable = true;
        var cmds = 'cmedit set NetworkElement=' + currentNode.name + ',CmNodeHeartbeatSupervision=1 active=false\n';
        cmds += 'cmedit set NetworkElement=' + currentNode.name + ',InventorySupervision=1 active=false\n';
        cmds += 'cmedit set NetworkElement=' + currentNode.name + ',FmAlarmSupervision=1 active=false\n';
        cmds += 'cmedit set NetworkElement=' + currentNode.name + ',PmFunction=1 pmEnabled=false\n';
        cmds += 'cmedit action NetworkElement=' + currentNode.name + ',CmFunction=1 deleteNrmDataFromEnm\n';
        cmds += 'cmedit delete NetworkElement=' + currentNode.name + ' -ALL --force\n\n';
        $scope.form.generatedScript += cmds;
    };
    this.callbackGenerateScriptForPmFunctionEnabled = function(callbackParams) {
        var currentNode = callbackParams.currentNode;
        var cmds = 'cmedit set NetworkElement=' + currentNode.name + ',PmFunction=1 pmEnabled=true\n';
        $scope.form.generatedScript += cmds;
    };
    this.callbackGenerateScriptForPmFunctionDisabled = function(callbackParams) {
        var currentNode = callbackParams.currentNode;
        var cmds = 'cmedit set NetworkElement=' + currentNode.name + ',PmFunction=1 pmEnabled=false\n';
        $scope.form.generatedScript += cmds;
    };
    this.callbackGenerateScriptForSetNodeIps = function(callbackParams) {
        var currentNode = callbackParams.currentNode;
        var cmds = 'cmedit set NetworkElement=' + currentNode.name + ', ComConnectivityInformation=1 ipAddress="' + currentNode.ip + '"\n';
        $scope.form.generatedScript += cmds;
    };
}
angular.module('nodeManagement').
component('nodeManagement', {
    templateUrl: 'assets/modules/node-management/node-management.template.html',
    controller: NodeManagementController
});
