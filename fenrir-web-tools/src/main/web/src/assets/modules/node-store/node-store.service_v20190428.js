var nodeStoreModule = angular.module("nodeStore");
nodeStoreModule.factory("nodeStoreService", function(pouchDB) {

  var service = {
    DEFAULT_IDS: {
      DEFAULT_NETWORK: "DEFAULT_NETWORK",
      DEFAULT_SIMULATION: "DEFAULT_SIMULATION",
      NODE_TYPES: "NODE_TYPES",
      LIVE_NETWORK_DATA: "LIVE_NETWORK_DATA"
    },
    TYPES: {
      LIVE_NETWORK_DATA: "LIVE_NETWORK_DATA",
      NETWORK: "NETWORK",
      NODE_TYPE: "NODE_TYPE"
    },
    DEFAULT_INSTANCES: {
      DEFAULT_LIVE_NETWORK_DATA: {
          _id: "LIVE_NETWORK_DATA",
          networks: [
            {
              id: "DEFAULT_NETWORK",
              name: 'Default Network',
              readOnly: true,
              selected: false,
              children: [
                {
                  id: "DEFAULT_SIMULATION",
                  name: "Default Simulation",
                  readOnly: true,
                  selected: false,
                  children: []
                }
              ]
            },
            {
              id: "NETWORK_1",
              name: 'NETWORK_1',
              readOnly: true,
              selected: false,
              children: [
                {
                  id: "NETWORK_1_SIMULATION_1",
                  name: "NETWORK_1_SIMULATION_1",
                  readOnly: true,
                  selected: false,
                  children: []
                },
                {
                  id: "NETWORK_1_SIMULATION_2",
                  name: "NETWORK_1_SIMULATION_2",
                  readOnly: true,
                  selected: false,
                  children: []
                }
              ]
            },
            {
              id: "NETWORK_2",
              name: 'NETWORK_2',
              readOnly: true,
              selected: false,
              children: [
                {
                  id: "NETWORK_2_SIMULATION_1",
                  name: "NETWORK_2_SIMULATION_1",
                  readOnly: true,
                  selected: false,
                  children: []
                },
                {
                  id: "NETWORK_2_SIMULATION_2",
                  name: "NETWORK_2_SIMULATION_2",
                  readOnly: true,
                  selected: false,
                  children: []
                },
                {
                  id: "NETWORK_2_SIMULATION_3",
                  name: "NETWORK_2_SIMULATION_3",
                  readOnly: true,
                  selected: false,
                  children: []
                }
              ]
            }
          ]
        },
        DEFAULT_NODE_TYPES: {
            _id: "NODE_TYPES",
            registeredNodeTypes: [
              "RadioNode",
              "5GRadioNode"
            ]
          }
    }
  };

   service.db = pouchDB('nodeStoreDb');
   service.db.destroy().then(function (response) {
     service.db = new PouchDB('nodeStoreDb');
     PouchDB.debug.enable('pouchdb:find');
     console.log("Database created");
     console.log(response);
   }).then(function () {
     return service.db.put(service.DEFAULT_INSTANCES.DEFAULT_NODE_TYPES);
   }).then(function (persistedNodeTypes) {
     console.log("Persisted node types");
     console.log(persistedNodeTypes);
   }).then(function () {
     return service.db.put(service.DEFAULT_INSTANCES.DEFAULT_LIVE_NETWORK_DATA);
   }).then(function (persistedLiveNetworkData) {
     console.log("Persisted live network data");
     console.log(persistedLiveNetworkData);
     console.log("Initialisation completed");
   }).catch( function (err) {
     console.log(err);
   });

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


  // NodeTypes Management
  service.getNodeTypesCatalog = function() {
    console.info("Retrieving node types catalog...");
    return service.db.get(service.DEFAULT_IDS.NODE_TYPES);
  }

  // Networks Management
  service.getNetworksCatalog = function() {
    console.info("Retrieving networks catalog...");
    function handleError(error) {
      console.error("Could not retrieve networks catalog");
      console.error(error);
    }

    function handleRetrievalOfNetworks(queryResult) {
      console.info("Retrieved networks from live network data: ");
      console.debug(queryResult);
      var networks = [];
      if (queryResult.docs.length > 0 && queryResult.docs[0].networks.length > 0) {
        networks = queryResult.docs[0].networks;
        console.debug("Converted networks");
        console.debug(networks);
      }

      return networks;
    }

    return service.db.createIndex({
          index: {fields: ["networks"]}
        }).then(function (result) {
          console.info("Index created on networks");
          console.debug(result);
          return service.db.find(
            {
              selector: { _id: service.DEFAULT_IDS.LIVE_NETWORK_DATA},
              fields: ["networks"]
            }
           ).then(handleRetrievalOfNetworks)
           .catch(handleError);
        }).catch(handleError);
  }

  // Simulations management
  service.getSimulationsForNetwork = function(network) {
    console.info("Retrieving simulations for network id: %s", network.id);

    function handleError(error) {
      console.error("Could not retrieve simulations catalog");
      console.error(error);
    }

    function querySimulationsForNetwork(indexCreationResult) {
      console.info("index created for querying simulations");
      console.info(indexCreationResult);
      var selector = {
        selector: {
          "_id": service.DEFAULT_IDS.LIVE_NETWORK_DATA,
          "networks": {
            "$elemMatch": {
              "id": {
                "$eq": network.id
              }
            }
          }
        }
      };

      return service.db
        .find(selector)
        .then(handleRetrievalOfSimulations)
        .catch(handleError);
    }

    function handleRetrievalOfSimulations(queryResult) {
      console.info("Retrieved simulations from live network data: ");
      console.debug(queryResult);
      var matchedNetwork = undefined;
      var simulationsForMatchedNetwork = [];
      if (queryResult.docs.length > 0 && queryResult.docs[0].networks.length > 0) {
        var retrievedNetworks = queryResult.docs[0].networks;
        for (var indexOfRetrievedNetworks = 0; indexOfRetrievedNetworks < retrievedNetworks.length;
            indexOfRetrievedNetworks++) {
            if (retrievedNetworks[indexOfRetrievedNetworks].id === network.id) {
              matchedNetwork = retrievedNetworks[indexOfRetrievedNetworks];
              console.log("Found matching network id: %s", matchedNetwork.id);
              simulationsForMatchedNetwork = matchedNetwork.children;
              console.log("Found %d simulations for matched network id %s", simulationsForMatchedNetwork.length,
                matchedNetwork.id);
              break;
            }
        }
      }

      return simulationsForMatchedNetwork;
    }

    return service.db.createIndex({
      index: {
        fields:
          [
            "_id",
            "networks.[].id"
          ]
        }
      })
      .then(querySimulationsForNetwork)
      .catch(handleError);
  }


  // LiveNetworkData Management
  service.getLiveNetworkData = function() {
    console.info("Retrieving live network data...");
    return service.db.get(service.DEFAULT_IDS.LIVE_NETWORK_DATA);
  };

  service.clearLiveNetworkData = function() {
    return service.getLiveNetworkData().then(function (liveNetworkData) {
        liveNetworkData.networks = service.DEFAULT_INSTANCES.DEFAULT_LIVE_NETWORK_DATA.networks;
        service.updateLiveNetworkData(liveNetworkData);
    });
  };

  service.updateLiveNetworkData = function(liveNetworkData) {
    return service.getLiveNetworkData().then(function (retrievedLiveNetworkData) {
      retrievedLiveNetworkData.networks = liveNetworkData.networks;
      return service.db.put(retrievedLiveNetworkData).then(function (updatedLiveNetworkData) {
        return service.getLiveNetworkData();
      }).catch(function (error) {
        console.error("Could not retrieve live network data after update");
        console.error(error);
      });
    }).catch(function (error) {
      console.error("Could not retrieve live network data for update");
      console.error(error);
    });
  };



  // Old implementation
  service.getSelectedLiveNetworkData = function() {
    var selectedLiveNetworkData = JSON.parse(JSON.stringify(service.liveNetworkData));

    // First level are the networks
    var filteredNetworks = [];
    for (var networkIndex = 0; networkIndex < selectedLiveNetworkData.length; networkIndex++) {
      var currentNetwork = this.extractNetworkFromIndex(selectedLiveNetworkData, networkIndex);
      console.info("Processing Network id=%s with name=%s", currentNetwork.id, currentNetwork.name);

      // Second level are simulations
      var filteredSimulations = [];
      for (var simulationIndex = 0; simulationIndex < this.getNumberOfChildren(currentNetwork); simulationIndex++) {
        var currentSimulation = this.extractSimulationFromIndex(selectedLiveNetworkData, networkIndex, simulationIndex);
        console.info("Processing Simulation id=%s with name=%s", currentSimulation.id, currentSimulation.name);

        // Third level are nodes
        var filteredNodes = [];
        for (var nodeIndex = 0; nodeIndex < this.getNumberOfChildren(currentSimulation); nodeIndex++) {
          var currentNode = this.extractNodeFromIndex(selectedLiveNetworkData, networkIndex, simulationIndex, nodeIndex);
          console.info("Processing Node id=%s with name=%s", currentNode.id, currentNode.name);
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
