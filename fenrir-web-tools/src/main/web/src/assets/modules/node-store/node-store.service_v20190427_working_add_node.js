var nodeStoreModule = angular.module("nodeStore");
nodeStoreModule.factory("nodeStoreService", function() {
   var service = {}

   service.db = new PouchDb('nodeStoreDb');

   service.liveNetworkData =
      [
         {
            "id": "network",
            "name": "Network",
            "children": [
               {
                  "id": "us",
                  "name": "Unknown simulation",
                  "children": [
                     {
                        "id": "us-n-01",
                        "name": "Node 01",
                        "children": [],
                        "selected": false,
                        "ip": "0.0.0.0",
                        "nodeType": "RadioNode"
                     },
                     {
                        "id": "us-n-02",
                        "name": "Node 02",
                        "children": [],
                        "selected": false,
                        "ip": "0.0.0.0",
                        "nodeType": "RadioNode"
                     }
                  ],
                  "selected": false
               },
               {
                  "id": "sim-01",
                  "name": "Simulation 01",
                  "children": [
                     {
                        "id": "sim-01-n-01",
                        "name": "Node 01",
                        "children": [],
                        "selected": false,
                        "ip": "0.0.0.0",
                        "nodeType": "RadioNode"
                     },
                     {
                        "id": "sim-01-n-02",
                        "name": "Node 02",
                        "children": [],
                        "selected": false,
                        "ip": "0.0.0.0",
                        "nodeType": "RadioNode"
                     }
                  ],
                  "selected": false
               },
               {
                  "id": "sim-02",
                  "name": "Simulation 02",
                  "children": [],
                  "selected": false
               },
               {
                  "id": "sim-03",
                  "name": "Simulation 03",
                  "children": [
                     {
                        "id": "sim-03-n-01",
                        "name": "Node 01",
                        "children": [],
                        "selected": false,
                        "ip": "0.0.0.0",
                        "nodeType": "RadioNode"
                     },
                     {
                        "id": "sim-03-n-02",
                        "name": "Node 02",
                        "children": [],
                        "selected": false,
                        "ip": "0.0.0.0",
                        "nodeType": "RadioNode"
                     },
                     {
                        "id": "sim-03-n03",
                        "name": "Node 03",
                        "children": [],
                        "selected": false,
                        "ip": "0.0.0.0",
                        "nodeType": "RadioNode"
                     }
                  ],
                  "selected": false
               }
            ],
            "selected": false
         }
      ];

  service.catalogs.nodeTypes = [
    id: "RadioNode",
    id: "5GRadioNode"
  ];

  service.catalogs.networks = [
    {
      id: "DEFAULT_NETWORK",
      name: "Default Network",
      simulations: [
        {
          id: "DEFAULT_SIMULATION",
          name: "Default Simulation"
        }
      ]
    }
  ];

  // Simulations Management
  service.addSimulationToCatalogForNetworkId = function(networkId, simulationId, simulationName) {
    var indexForExistingSimulation = service.getNetworkFromCatalogById(id);
    if (indexForExistingSimulation == -1) {
      service.simulations.push( { id: id, name: name} );
      service.sortSimulationsCatalog();
    }
    return service.getSimulationFromCatalogById(id);
  };
  service.getSimulationFromCatalogById = function(id) {
    var indexForExistingSimulation = service.getSimulationIndexFromCatalogById(id);
    if (indexForExistingSimulation > -1) {
      return service.simulations[indexForExistingSimulation];
    }
    return null;
  };
  service.getSimulationFromCatalogByName = function(name) {
    var indexForExistingSimulation = service.getSimulationIndexFromCatalogByName(name);
    if (indexForExistingSimulation > -1) {
      return service.simulations[indexForExistingSimulation];
    }
    return null;
  };
  service.getSimulationIndexFromCatalogById = function(id) {
    for (var i=0; i < service.simulations.length; i++) {
      if (service.simulations[i].id === id) {
        return i;
      }
    }
    return -1;
  };
  service.getSimulationIndexFromCatalogByName = function(name) {
    for (var i=0; i < service.simulations.length; i++) {
      if (service.simulations[i].name === name) {
        return i;
      }
    }
    return -1;
  };
  service.sortSimulationsCatalog = function() {
      var simulationsArraySortedByName = service.simulations.slice(0);
      simulationsArraySortedByName.sort(function(a,b) {
          return a.name - b.name;
      });
      service.simulations = simulationsArraySortedByName;
  };

  // Node Types Management
  service.getNodeTypesCatalog = function() {
    return service.catalogs.nodeTypes;
  };
  service.addNodeTypeToCatalog = function(nodeType) {
    var indexForExistingNodeType = service.getNodeTypeIndexFromCatalog(nodeType);
    if (indexForExistingNodeType == -1) {
      service.catalogs.nodeTypes.push(nodeType);
      service.catalogs.nodeTypes.sort();
    }
    return service.getNodeTypeFromCatalog(nodeType);
  };
  service.getNodeTypeFromCatalog = function(nodeType) {
    var indexForExistingNodeType = service.getNodeTypeIndexFromCatalog(nodeType);
    if (indexForExistingNodeType > -1) {
      return service.catalogs.nodeTypes[indexForExistingNodeType];
    }
    return null;
  };
  service.getNodeTypeIndexFromCatalog = function(nodeType) {
    for (var nodeTypeIndex = 0; service.catalogs.nodeTypes.length; nodeTypeIndex++) {
      if (service.catalogs.nodeTypes[nodeTypeIndex] === nodeType.id) {
        return nodeTypeIndex;
      }
    }
    return -1;
  };

  // Networks Catalog Management
  service.getNetworksCatalog = function() {
    return service.catalogs.networks;
  };
  service.addNetworkToCatalog = function(id, name) {
    var indexForExistingNetwork = service.getNetworkIndexFromCatalogById(id);
    if (indexForExistingNetwork == -1) {
      service.catalogs.networks.push( { id: id, name: name} );
      service.sortNetworksCatalog();
    }
    return service.getNetworkFromCatalogById(id);
  };
  service.getNetworkFromCatalogById = function(id) {
    var indexForExistingNetwork = service.getNetworkIndexFromCatalogById(id);
    if (indexForExistingNetwork > -1) {
      return service.catalogs.networks[indexForExistingNetwork];
    }
    return null;
  };
  service.getNetworkFromCatalogByName = function(name) {
    var indexForExistingNetwork = service.getNetworkIndexFromCatalogByName(name);
    if (indexForExistingNetwork > -1) {
      return service.catalogs.networks[indexForExistingNetwork];
    }
    return null;
  };
  service.getNetworkIndexFromCatalogById = function(id) {
    for (var i=0; i < service.catalogs.networks.length; i++) {
      if (service.catalogs.networks[i].id === id) {
        return i;
      }
    }
    return -1;
  };
  service.getNetworkIndexFromCatalogByName = function(name) {
    for (var i=0; i < service.catalogs.networks.length; i++) {
      if (service.catalogs.networks[i].name === name) {
        return i;
      }
    }
    return -1;
  };
  service.sortNetworksCatalog = function() {
      var networksArraySortedByName = service.catalogs.networks.slice(0);
      networksArraySortedByName.sort(function(a,b) {
          return a.name - b.name;
      });
      service.catalogs.networks = networksArraySortedByName;
  };

  // Nodes Management
  service.addSingleNode = function(newNode) {
      // Get Network
      var networkFromCatalog =
        service.findOrCreateNetworkFromCatalog(newNode.network.id, newNode.network.newName);


      // Get Simulation
      var simulationFromCatalog =
        service.findOrCreateSimulationFromCatalog(newNode.simulation.id, newNode.simulation.newName);

      // Get Node Type
      var nodeTypeFromCatalog =
        service.findOrCreateNodeTypeFromCatalog(newNode.nodeType.name, newNode.nodeType.newName);

      service.addNodeToLiveNetworkData(networkFromCatalog, simulationFromCatalog,
                                                     nodeTypeFromCatalog, newNode);
  };

  service.addBatchOfNodes = function(nodesBatch) {
    var newNodes = nodesBatch.newNodes;
    if (newNodes.length > 0) {
      // Get Network
      var networkFromCatalog =
        service.findOrCreateNetworkFromCatalog(nodesBatch.network.id, nodesBatch.network.newName);


      // Get Simulation
      var simulationFromCatalog =
        service.findOrCreateSimulationFromCatalog(nodesBatch.simulation.id, nodesBatch.simulation.newName);

      // Get Node Type
      var nodeTypeFromCatalog =
        service.findOrCreateNodeTypeFromCatalog(nodesBatch.nodeType.name, nodesBatch.nodeType.newName);

      for (var i = 0;  i < newNodes.length; i++) {
          var newNode = newNodes[i];
          service.addNodeToLiveNetworkData(networkFromCatalog, simulationFromCatalog,
                                                               nodeTypeFromCatalog, newNode);
      }
    } else {
      console.log("No nodes were added to collection. Ignoring request.");
    }
  };

  service.addNodeToLiveNetworkData = function(networkFromCatalog, simulationFromCatalog,
              nodeTypeFromCatalog, newNode) {
      // Convert network to format for live network data
      var networkLiveNetworkData = service.getLiveNetworkById(networkFromCatalog.id);
      // Element not found, add a new one
      if (networkLiveNetworkData == undefined) {
        networkLiveNetworkData = JSON.parse(JSON.stringify(networkFromCatalog));
        networkLiveNetworkData.children = [];
        networkLiveNetworkData.selected = false;
        // Add the new network to the live data
        service.getLiveNetworkData().push(networkLiveNetworkData);
      } else {
        // Element found, do nothing for now
        console.log("Network already exists. id=%s, name=%s", networkLiveNetworkData.id, networkLiveNetworkData.name);
      }

      // Convert simulation to format for live network data
      var simulationLiveNetworkData = service.getLiveSimulationById(simulationFromCatalog.id);
      if (!simulationLiveNetworkData) {
        // Simulation wasn't found, will attach it to the current network
        simulationLiveNetworkData = JSON.parse(JSON.stringify(simulationFromCatalog));
        simulationLiveNetworkData.children = [];
        simulationLiveNetworkData.selected = false;
        networkLiveNetworkData.children.push(simulationLiveNetworkData);
        console.log("Attached simulation id=%s, name=%s to Network id=%s, name=%s", simulationLiveNetworkData.id,
          simulationLiveNetworkData.name, networkLiveNetworkData.id, networkLiveNetworkData.name);
      } else {
        // Element found, do nothing for now
        console.log("Simulation already exists. id=%s, name=%s", simulationLiveNetworkData.id, simulationLiveNetworkData.name);
      }

      // Attach node to simulation
      var newNodeToSave = {
        id: service.create_UUID(),
        name: newNode.node.name,
        children: [],
        selected: false,
        ip: newNode.node.ip,
        neType: nodeTypeFromCatalog
      };
      simulationLiveNetworkData.children.push(newNodeToSave);
  };

  service.findOrCreateNetworkFromCatalog = function(networkId, newNetworkName) {
      var networkFromCatalog = service.getNetworkFromCatalogById(networkId);
      if (networkFromCatalog == null) {
        var newNetworkId = service.create_UUID();
        networkFromCatalog = service.addNetworkToCatalog(newNetworkId, newNetworkName);
      }
      return networkFromCatalog;
  };

  service.findOrCreateSimulationFromCatalog = function(simulationId, newSimulationName) {
      var simulationFromCatalog = service.getSimulationFromCatalogById(simulationId);
      if (simulationFromCatalog == null) {
        var newSimulationId = service.create_UUID();
        simulationFromCatalog = service.addSimulationToCatalog(newSimulationId, newSimulationName);
      }
      return simulationFromCatalog;
  };

  service.findOrCreateNodeTypeFromCatalog = function(nodeTypeName, nodeTypeNewName) {
      var nodeTypeFromCatalog = service.getNodeTypeFromCatalog(nodeTypeName);
      if (nodeTypeFromCatalog == null) {
        service.addNodeTypeToCatalog(nodeTypeNewName);
      }
      return nodeTypeFromCatalog;
  };


  // LiveNetworkData Management
  service.getLiveNetworkData = function() {
    return service.liveNetworkData;
  };

  service.clearLiveNetworkData = function() {
    return service.liveNetworkData = [];
  };


  service.getSelectedLiveNetworkData = function() {
    var selectedLiveNetworkData = JSON.parse(JSON.stringify(service.liveNetworkData));

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
          filteredNodes = currentSimulation.children.filter(function(value, index, arr){
              return value.selected;
          });
          selectedLiveNetworkData[networkIndex].children[simulationIndex].children = filteredNodes;
        }
      }

      // Remove simulation that aren't selected and reassign them to the parent network
      if (this.hasChildren(currentNetwork)) {
        // Check if there are selected simulations, if not, remove
        filteredSimulations = selectedLiveNetworkData[networkIndex].children.filter(function(value, index, arr){
          return value.children.length > 0;
        });
        selectedLiveNetworkData[networkIndex].children = filteredSimulations;
      }
    }

    // Remove networks that aren't selected and reassign them to the root
    if (selectedLiveNetworkData.length > 0) {
      // Check if there are selected networks, if not, remove
      filteredNetworks = selectedLiveNetworkData.filter(function(value, index, arr){
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

    service.iterateOverSelectedLiveNetworkData(function (callbackParams) {
      selectedLiveNetworksMap.set(callbackParams.currentNetwork.id, callbackParams.currentNetwork);
      selectedLiveSimulationsMap.set(callbackParams.currentSimulation.id, callbackParams.currentSimulation);
      selectedLiveNodesMap.set(callbackParams.currentNode.id, callbackParams.currentNode.name);
    });

    return {
      selectedLiveNetworks: Array.from(selectedLiveNetworksMap.values()),
      selectedLiveSimulations: Array.from(selectedLiveSimulationsMap.values()),
      selectedLiveNodes: Array.from(selectedLiveNodesMap.values())
    };
  };

  service.iterateOverSelectedLiveNetworkData = function(callback) {
    var selectedLiveNetworkData = this.getSelectedLiveNetworkData();

    for(var networkIndex = 0; networkIndex < selectedLiveNetworkData.length; networkIndex++) {
      var currentNetwork = selectedLiveNetworkData[networkIndex];
      for(var simulationIndex = 0; simulationIndex < currentNetwork.children.length; simulationIndex++) {
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

  // LiveNetworkData - Networks Management
  service.getLiveNetworks = function() {
    var liveNetworks = [];
    for (var networkIndex = 0; networkIndex < service.liveNetworkData.length; networkIndex++) {
      // First level are networks
      liveNetworks.push(service.liveNetworkData[networkIndex]);
    }
     return liveNetworks;
  };

  service.getLiveNetworkById = function(id) {
    var liveNetworks = service.getLiveNetworks();
    for (var networkIndex = 0; networkIndex < liveNetworks.length; networkIndex++) {
      var currentLiveNetwork = liveNetworks[networkIndex];
      if (currentLiveNetwork.id === id) {
          return currentLiveNetwork;
      }
    }
     return undefined;
  };

  // LiveNetworkData - Simulations Management
  service.getLiveSimulations = function() {
    var liveSimulationsMap = new Map();
    var liveSimulations = [];
    for (var networkIndex = 0; networkIndex < service.liveNetworkData.length; networkIndex++) {
      // First level are networks
      if (service.liveNetworkData[networkIndex].children.length > 0) {
        // Second level are simulations
        for (var simulationIndex = 0; simulationIndex < service.liveNetworkData[networkIndex].children.length; simulationIndex++) {
          var currentSimulation = service.liveNetworkData[networkIndex].children[simulationIndex];
          liveSimulationsMap.set(currentSimulation.id, currentSimulation);
        }
      }
    }

    liveSimulationsMap.forEach(function(value, key) {
      liveSimulations.push(value);
    });
    return liveSimulations;
  };

  service.getLiveSimulationById = function(id) {
    var liveSimulations = service.getLiveSimulations();
    for (var simulationIndex = 0; simulationIndex < liveSimulations.length; simulationIndex++) {
      var currentSimulation = liveSimulations[simulationIndex];
      if (currentSimulation.id === id) {
        return currentSimulation;
      }
    }
    return undefined;
  };

  service.create_UUID = function() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

  return service;
});
