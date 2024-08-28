function NodeManagementController($scope, $mdDialog) {
  var ctrl = this;
  var originatorEv;

  ctrl.openMenu = function($mdMenu, ev) {
    originatorEv = ev;
    $mdMenu.open(ev);
    console.log("Clicked");
  };

    ctrl.showDialog = function ($event, templateUrl, selectedScript) {
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

      function DialogController($rootScope, $scope, $mdDialog, nodeStoreStagedNodeTypesService, selectedScript) {
        var ctrl = this;
        $scope.nodeStoreStagedNodeTypesService = nodeStoreStagedNodeTypesService;
        ctrl._mdDialog = $mdDialog;

        $scope.selectedScript = selectedScript;

        $scope.nodeTypesCatalog = [];
        $scope.networksCatalog = [];
        $scope.simulationsCatalog = [];

        $scope.form = {
          loadFromRawNetsimSimulation: true,
          netsimRawData: '',
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
          }
        };


        ctrl.populateNodeTypesCatalog = function() {
          $scope.nodeTypesCatalog = nodeStoreStagedNodeTypesService.getNodeTypesCatalog();
          if ($scope.nodeTypesCatalog.length > 0) {
            $scope.form.newNode.nodeType.name = $scope.nodeTypesCatalog[0];
          }
        };

        ctrl.populateNetworksCatalogAndThenLoadSimulations = function() {
            nodeStoreService.getNetworksCatalog()
                .then(function(networksCatalog) {
                    $scope.networksCatalog = networksCatalog;
                    console.log("Populated networks catalog...");
                    console.log($scope.networksCatalog);
                    if (networksCatalog.length > 0) {
                        $scope.form.newNode.network.id = networksCatalog[0].id
                        console.log("Set default network to %s", $scope.form.newNode.network.id);
                        ctrl.populateSimulationsCatalog();
                    }
                });
        };

        ctrl.populateSimulationsCatalog = function() {
           console.info("Loading simulations catalog. Currently selected network id: %s", $scope.form.newNode.network.id);
            nodeStoreService.getSimulationsForNetworkFromCatalog($scope.form.newNode.network)
                .then(function(retrievedSimulationsCatalog) {
                    $scope.simulationsCatalog = retrievedSimulationsCatalog;
                    console.log("Populated simulations catalog...");
                    console.log($scope.simulationsCatalog);
                    if (retrievedSimulationsCatalog.length > 0) {
                        $scope.form.newNode.simulation.id = retrievedSimulationsCatalog[0].id;
                        console.log("Set default simulation to: %s", $scope.form.newNode.simulation.id);
                    }

                })
                .catch(function(error) {
                    console.error("Could not retrieve simulations for network id: %s", $scope.form.newNode.network.id);
                    console.error(error);
                });
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


        var summaryOfSelectedLiveNetworkData = $scope.nodeStoreService.getSummaryOfSelectedLiveNetworkData();
        $scope.selectedLiveNetworks = summaryOfSelectedLiveNetworkData.selectedLiveNetworks;
        $scope.selectedLiveSimulations = summaryOfSelectedLiveNetworkData.selectedLiveSimulations;
        $scope.selectedLiveNodes = summaryOfSelectedLiveNetworkData.selectedLiveNodes;

        this.$onInit = function () {
          switch ($scope.selectedScript) {
            case 0:
              nodeStoreService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForAddNodes(true));
              break;
            case 1:
              nodeStoreService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForAddNodes(false));
              break;
            case 2:
              nodeStoreService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForDeleteNodes);
              break;
            case 3:
              nodeStoreService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForPmFunctionEnabled);
              break;
            case 4:
              nodeStoreService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForPmFunctionDisabled);
              break;
            case 5:
              nodeStoreService.iterateOverSelectedLiveNetworkData(this.callbackGenerateScriptForSetNodeIps);
              break;
            default:
              console.log("No option selected. Ignoring event.");
              break;
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

        $scope.clearNodeData = function() {
          console.log("Clicked on clearNodeData");

          $scope.nodeStoreService.clearLiveNetworkData();

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
          alert("Not implemented!!!");
          console.log($scope.form);
          $mdDialog.hide();
        };

        ctrl.saveNodeDataFromRawNetsimSimulation = function() {
          console.log("Called saveNodeDataFromRawNetsimSimulation");
          var nodeDataCollection = this.parseNetsimSimulationRawData();
          var nodesBatch = {
            nodeType: $scope.form.newNode.nodeType,
            network: $scope.form.newNode.network,
            simulation: $scope.form.newNode.simulation,
            newNodes: []
          };
          for (var parsedNodeIndex = 0; parsedNodeIndex < nodeDataCollection.length; parsedNodeIndex++) {
              var parsedNode = nodeDataCollection[parsedNodeIndex];
              var newNode = {
                node: {
                  name: parsedNode.name,
                  ip: parsedNode.ip
                }
              }
             nodesBatch.newNodes.push(newNode);
          }

          nodeStoreService.addBatchOfNodes(nodesBatch);
        };

        ctrl.parseNetsimSimulationRawData = function() {
            var nodePrefix = 'LTE';
            var nodesData = [];
            var lines = $scope.form.netsimRawData.split("\n");
            for (var i = 0; i < lines.length; i++) {
                if (lines[i] != null && !/^\s*$/.test(lines[i])) {
                    var nodeName = lines[i].match(new RegExp(nodePrefix + "([a-zA-Z0-9]+)", "g"));
                    var nodeIp = lines[i].match(/((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}/g);
                    if (nodeIp == null || nodeIp.length == 0) {
                        nodeIp = lines[i].match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g);
                    }
                    if (nodeName != null) nodeName = nodeName[0];
                    if (nodeIp != null) nodeIp = nodeIp[0];
                    nodesData.push({name: nodeName, ip: nodeIp});
                }
            }
            return nodesData;
        }

        ctrl.saveNodeDataFromManualInput = function() {
          console.log("Called saveNodeDataFromManualInput");
          var newNode = JSON.parse(JSON.stringify($scope.form.newNode));
          nodeStoreService.addSingleNode(newNode);
        };

        this.callbackGenerateScriptForAddNodes = function(pmFunctionEnable) {
          return function(callbackParams) {
            var currentNode = callbackParams.currentNode;
            var cmds = 'cmedit create NetworkElement=' + currentNode.name + ' networkElementId=' + currentNode.name + ', neType="' + currentNode.nodeType + '", ossPrefix="" -ns=OSS_NE_DEF -version=2.0.0\n';
            cmds += 'cmedit create NetworkElement=' + currentNode.name + ',ComConnectivityInformation=1 comConnectivityInformationId="1",transportProtocol="TLS",snmpVersion="SNMP_V3",snmpSecurityName="mediation",snmpSecurityLevel="NO_AUTH_NO_PRIV",ipAddress="' + currentNode.ip + '",port=6513 -namespace=COM_MED -version=1.1.0\n';
            cmds += 'secadm credentials create --secureusername netsim --secureuserpassword netsim --ldapuser disable -n ' + currentNode.name + '\n';
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
