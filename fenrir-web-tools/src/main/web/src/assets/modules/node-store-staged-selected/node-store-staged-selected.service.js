var nodeStoreStagedSelectedModule = angular.module("nodeStoreStagedSelected");
nodeStoreStagedNodeTypesModule.factory("nodeStoreStagedSelectedService", function(nodeStoreStagedService) {
    var service = {};
    //  service.getSelectedLiveNetworkData = function() {
    //    var copyOfNetworks = JSON.parse(JSON.stringify(nodeStoreStagedService.data.networks));
    //    var selectedLiveNetworkData = [];
    //
    //    var visitTreeElement = function(network, simulation, treeElement) {
    //        if (treeElement == undefined) {
    //          return;
    //        } else {
    //          if (treeElement.children != undefined && treeElement.children.length > 0) {
    //            if (treeElement.type === "NETWORK" || treeElement.type === "SIMULATION") {
    //              if (treeElement.type === "SIMULATION") {
    //                simulation == treeElement;
    //              }
    //              for (var indexOfTreeElement = 0; indexOfTreeElement < treeElement.children.length; indexOfTreeElement++) {
    //                visitTreeElement(network, simulation, treeElement.children[indexOfTreeElement]);
    //              }
    //            }
    //          } else {
    //            if (treeElement.type == "NETWORK") {
    //              console.log("Visiting NETWORK name=%s", treeElement.name);
    //            } else if (treeElement.type == "SIMULATION") {
    //              console.log("Visiting SIMULATION name=%s", treeElement.name);
    //            } else if (treeElement.type == "NODE") {
    //              console.log("Visiting NODE name=%s", treeElement.name);
    //            } else {
    //              console.error("Visiting unknown type");
    //              console.error(treeElement);
    //            }
    //          }
    //        }
    //      }
    //
    //    for (var indexOfNetwork = 0; indexOfNetwork < copyOfNetworks.length; indexOfNetwork++) {
    //      var currentNetwork = copyOfNetworks[indexOfNetwork];
    //      var currentSimulation = undefined;
    //      var currentTreeElement = copyOfNetworks[indexOfNetwork];
    //      visitTreeElement(currentNetwork, currentSimulation, currentTreeElement);
    //    }
    //
    //    return selectedLiveNetworkData;
    //  };
    //
    //  service.visitTreeElement = function(treeElement) {
    //    if (treeElement == undefined) {
    //      return;
    //    } else {
    //      if (treeElement.children != undefined && treeElement.children.length > 0) {
    //        for (var indexOfTreeElement = 0; indexOfTreeElement < treeElement.children.length; indexOfTreeElement++) {
    //          service.visitTreeElement(treeElement.children[indexOfTreeElement]);
    //        }
    //      } else {
    //        if (treeElement.type == "NETWORK") {
    //          console.log("Visiting NETWORK name=%s", treeElement.name);
    //        } else if (treeElement.type == "SIMULATION") {
    //          console.log("Visiting SIMULATION name=%s", treeElement.name);
    //        } else if (treeElement.type == "NODE") {
    //          console.log("Visiting NODE name=%s", treeElement.name);
    //        } else {
    //          console.error("Visiting unknown type");
    //          console.error(treeElement);
    //        }
    //      }
    //    }
    //  };
    service.getSelectedLiveNetworkData = function() {
        var selectedLiveNetworkData = JSON.parse(JSON.stringify(nodeStoreStagedService.data.networks));
        // First level are the networks
        var filteredNetworks = [];
        for (var networkIndex = 0; networkIndex < selectedLiveNetworkData.length; networkIndex++) {
            var currentNetwork = this.extractNetworkFromIndex(selectedLiveNetworkData, networkIndex);
            console.log("Processing Network id=%s with name=%s", currentNetwork.id, currentNetwork.name);
            // Second level are simulations
            var filteredSimulations = [];
            for (var simulationIndex = 0; simulationIndex < this.getNumberOfChildren(currentNetwork); simulationIndex++) {
                var currentSimulation = this.extractSimulationFromIndex(selectedLiveNetworkData, networkIndex, simulationIndex);
                console.log("Processing Simulation id=%s with name=%s", currentSimulation.id, currentSimulation.name);
                // Third level are nodes
                var filteredNodes = [];
                for (var nodeIndex = 0; nodeIndex < this.getNumberOfChildren(currentSimulation); nodeIndex++) {
                    var currentNode = this.extractNodeFromIndex(selectedLiveNetworkData, networkIndex, simulationIndex, nodeIndex);
                    console.log("Processing Node id=%s with name=%s", currentNode.id, currentNode.name);
                }
                // Remove nodes that aren't selected and reassign them to the parent simulation
                if (this.hasChildren(currentSimulation)) {
                    // Check if there are selected nodes, if not, remove
                    filteredNodes = currentSimulation.children.filter(function(value, index, arr) {
                        return value.selected;
                    });
                    selectedLiveNetworkData[networkIndex].children[simulationIndex].children = filteredNodes;
                }
            }
            // Remove simulation that aren't selected and reassign them to the parent network
            if (this.hasChildren(currentNetwork)) {
                // Check if there are selected simulations, if not, remove
                filteredSimulations = selectedLiveNetworkData[networkIndex].children.filter(function(value, index, arr) {
                    return value.children.length > 0;
                });
                selectedLiveNetworkData[networkIndex].children = filteredSimulations;
            }
        }
        // Remove networks that aren't selected and reassign them to the root
        if (selectedLiveNetworkData.length > 0) {
            // Check if there are selected networks, if not, remove
            filteredNetworks = selectedLiveNetworkData.filter(function(value, index, arr) {
                return value.children.length > 0;
            });
            selectedLiveNetworkData = filteredNetworks;
        }
        return selectedLiveNetworkData;
    };
    service.getSummaryOfSelectedLiveNetworkData = function() {
        var selectedLiveNetworksMap = new Map();
        var selectedLiveSimulationsMap = new Map();
        var selectedLiveNodesMap = new Map();
        service.iterateOverSelectedLiveNetworkData(function(callbackParams) {
            selectedLiveNetworksMap.set(callbackParams.currentNetwork.id, callbackParams.currentNetwork);
            selectedLiveSimulationsMap.set(callbackParams.currentSimulation.id, callbackParams.currentSimulation);
            selectedLiveNodesMap.set(callbackParams.currentNode.id, {
                node: callbackParams.currentNode,
                network: callbackParams.currentNetwork,
                simulation: callbackParams.currentSimulation
            });
        });
        return {
            selectedLiveNetworks: Array.from(selectedLiveNetworksMap.values()),
            selectedLiveSimulations: Array.from(selectedLiveSimulationsMap.values()),
            selectedLiveNodes: Array.from(selectedLiveNodesMap.values())
        };
    };
    service.iterateOverSelectedLiveNetworkData = function(callback) {
        var selectedLiveNetworkData = this.getSelectedLiveNetworkData();
        for (var networkIndex = 0; networkIndex < selectedLiveNetworkData.length; networkIndex++) {
            var currentNetwork = selectedLiveNetworkData[networkIndex];
            for (var simulationIndex = 0; simulationIndex < currentNetwork.children.length; simulationIndex++) {
                var currentSimulation = currentNetwork.children[simulationIndex];
                for (var nodeIndex = 0; nodeIndex < currentSimulation.children.length; nodeIndex++) {
                    var currentNode = currentSimulation.children[nodeIndex];
                    var callbackParams = {
                        networkIndex: networkIndex,
                        currentNetwork: JSON.parse(JSON.stringify(currentNetwork)),
                        simulationIndex: simulationIndex,
                        currentSimulation: JSON.parse(JSON.stringify(currentSimulation)),
                        nodeIndex: nodeIndex,
                        currentNode: JSON.parse(JSON.stringify(currentNode)),
                    };
                    callback(callbackParams);
                }
            }
        }
    };

    service.getSlimmedSelectedLiveNodesData = function() {
        var selectedLiveNodesMap = new Map();
        service.iterateOverSelectedLiveNetworkData(function(callbackParams) {
            selectedLiveNodesMap.set(callbackParams.currentNode.id, {
                node: {
                  id: callbackParams.currentNode.id,
                  name: callbackParams.currentNode.name,
                  neType: callbackParams.currentNode.neType,
                  type: callbackParams.currentNode.type
                },
                network: {
                  id: callbackParams.currentNetwork.id,
                  name: callbackParams.currentNetwork.name
                },
                simulation: {
                  id: callbackParams.currentSimulation.id,
                  name: callbackParams.currentSimulation.name
                }
            });
        });
        return Array.from(selectedLiveNodesMap.values());
    };

    service.extractNetworkFromIndex = function(data, networkIndex) {
        return data[networkIndex];
    };
    service.extractSimulationFromIndex = function(data, networkIndex, simulationIndex) {
        return data[networkIndex].children[simulationIndex];
    };
    service.extractNodeFromIndex = function(data, networkIndex, simulationIndex, nodeIndex) {
        return data[networkIndex].children[simulationIndex].children[nodeIndex];
    };
    service.hasChildren = function(node) {
        return node.children.length > 0;
    };
    service.getNumberOfChildren = function(node) {
        return node.children.length;
    };
    return service;
});
