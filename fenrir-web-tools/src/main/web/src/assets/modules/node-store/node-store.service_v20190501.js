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


  service.DB = {
    QUERY: {
      INDEX: {
        NETWORK: {
          ALL: {
            index: {
              fields: ["networks"]
            }
          },
          BY_ID: {
            index: {
              fields: [
                "_id",
                "networks.[].id"
              ]
            }
          }
        }
      },
      SELECTOR: {
        NETWORK : {
          ALL: {
            selector: {
              _id: service.DEFAULT_IDS.LIVE_NETWORK_DATA
            },
            fields: ["networks"]
          },
          BY_ID: {
            selector: {
              "_id": service.DEFAULT_IDS.LIVE_NETWORK_DATA,
              "networks": {
                "$elemMatch": {
                  "id": {
                    "$eq": {}
                  }
                }
              }
            },
            replace: function(networkId) {
              var copyOfSelector = JSON.parse(JSON.stringify(this));
              copyOfSelector.selector.networks.$elemMatch.id.$eq = networkId;
              return copyOfSelector;
            }
          }
        }
      }
    }
  };


  /**
    * NodeTypes Management
    */
  service.getNodeTypesCatalogDoc = function() {
    console.info("Retrieving node types catalog raw doc...");

    function handleError(error) {
      console.error("Could not retrieve Node types catalog in raw doc");
      console.error(error);
    }

    function handleNodeTypesRetrieved(queryResult) {
      return queryResult;
    }

    return service.db.get(service.DEFAULT_IDS.NODE_TYPES)
           .then(handleNodeTypesRetrieved)
           .catch(handleError);
  }

  service.getNodeTypesCatalog = function() {
    console.info("Retrieving node types catalog...");

    function handleNodeTypesRetrieved(queryResult) {
      return queryResult.registeredNodeTypes;
    }

    return service.getNodeTypesCatalogDoc()
           .then(handleNodeTypesRetrieved);
  }

  service.getNodeTypeFromCatalogById = function(nodeTypeName) {
    console.info("Retrieving node type by id %s", nodeTypeName);

    function handleError(error) {
      console.error("Could not retrieve node type by id");
      console.error(error);
    }

    function handleRetrievedNodeTypesAndFindMatching(retrievedNodeTypes) {
      var matchingNodeType = undefined;

      for (var indexForRetrievedNodeTypes = 0; indexForRetrievedNodeTypes < retrievedNodeTypes.length;
            indexForRetrievedNodeTypes++) {
        if (retrievedNodeTypes[indexForRetrievedNodeTypes] === nodeTypeName) {
          matchingNodeType = retrievedNodeTypes[indexForRetrievedNodeTypes];
          break;
        }
      }

      return matchingNodeType;
    }

    return service.getNodeTypesCatalog()
           .then(handleRetrievedNodeTypesAndFindMatching)
           .catch(handleError);
  }

  service.updateNodeTypesCatalog = function(updatedRegisteredNodeTypes) {
    console.log("Updating node types catalog");

    function handleError(error) {
      console.error("Could not update node types catalog");
      console.error(error);

    }

    function handleRetrievedNodeTypesAndUpdate(nodeTypesDoc) {
      nodeTypesDoc.registeredNodeTypes = updatedRegisteredNodeTypes;
      return service.db
               .put(nodeTypesDoc)
               .then(handleUpdateOfNodeTypesCatalog)
               .catch(handleError)
    }

    function handleUpdateOfNodeTypesCatalog(updatedNodeTypesDoc) {
      console.log("Updated node types catalog");
      console.log(updatedNodeTypesDoc);
    }

    return service.getNodeTypesCatalogDoc()
           .then(handleRetrievedNodeTypesAndUpdate)
           .catch(handleError);
  }

  service.findOrCreateNodeTypeFromCatalog = function(newNode) {
    var nodeType = (newNode.nodeType.addNew) ? newNode.nodeType.newName : newNode.nodeType.name;

    function handleError() {
      console.log("");
    }

    function handleRetrievalOfNetworksCatalogById(retrievedNodeType) {
      if (retrievedNodeType == undefined) {
        console.log("Node type %s not found. Creating a new record", nodeType);
        return service.addNodeTypeToCatalog(nodeType);
      } else {
        console.log("Node type %s is already registered", nodeType);
      }
      return retrievedNodeType;
    }

    return service.getNodeTypeFromCatalogById(nodeType)
          .then(handleRetrievalOfNetworksCatalogById);
  };

  service.addNodeTypeToCatalog = function(nodeType) {

    function handleRetrievalOfNodeTypesCatalog(retrievedNodeTypes) {
      retrievedNodeTypes.push(nodeType);
      retrievedNodeTypes.sort();
      return service.updateNodeTypesCatalog(retrievedNodeTypes)
             .then(handleSuccessfulUpdate);
    }

    function handleSuccessfulUpdate(updatedNodeTypes) {
      console.log("Node types catalog updated");
      console.log(updatedNodeTypes);
      return service.getNodeTypeFromCatalogById(nodeType);
    }

    return service.getNodeTypesCatalog()
           .then(handleRetrievalOfNodeTypesCatalog);
  };

  /**
    * Networks Management
    */
  service.getNetworksCatalog = function() {
    console.info("Retrieving networks catalog...");
    function handleError(error) {
      console.error("Could not retrieve networks catalog");
      console.error(error);
    }

    function doAfterIndexCreation(result) {
      console.info("Index created on networks");
      console.debug(result);
      return service.db.find(service.DB.QUERY.SELECTOR.NETWORK.ALL)
            .then(doAfterQueryingForRetrievalOfNetworks)
            .catch(handleError);
    }

    function doAfterQueryingForRetrievalOfNetworks(queryResult) {
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

    return service.db.createIndex(service.DB.QUERY.INDEX.NETWORK.ALL)
       .then(doAfterIndexCreation)
       .catch(handleError);
  }

  service.getNetworkFromCatalogById = function(networkId) {
    console.log("Retrieving networks by Id: %s", networkId);

    function handleError(error) {
      console.error("Error while querying Network Catalog by Id");
      console.error(error);
    }

    function handleIndexCreationAndExecuteQuery(result) {
      console.info("Index created on networks by Id");
      console.debug(result);
      return service.db.find(service.DB.QUERY.SELECTOR.NETWORK.BY_ID.replace(networkId))
            .then(handleQueryResult)
            .catch(handleError);
    }

    function handleQueryResult(queryResult) {
      console.log("Retrieved networks by id: %s", networkId);
      console.debug(queryResult);
      var matchedNetwork = undefined;
      if (queryResult.docs.length > 0 && queryResult.docs[0].networks.length > 0) {
        var retrievedNetworks = queryResult.docs[0].networks;
        for (var indexOfRetrievedNetworks = 0; indexOfRetrievedNetworks < retrievedNetworks.length;
            indexOfRetrievedNetworks++) {
          if (retrievedNetworks[indexOfRetrievedNetworks].id === networkId) {
            matchedNetwork = retrievedNetworks[indexOfRetrievedNetworks];
            console.log("Found matching network id: %s", matchedNetwork.id);
            console.log(matchedNetwork);
            break;
          }
        }
      }

      return matchedNetwork;
    }

    return service.db
       .createIndex(service.DB.QUERY.INDEX.NETWORK.BY_ID)
       .then(handleIndexCreationAndExecuteQuery)
       .catch(handleError);
  };

  service.addNetworkToCatalog = function(id, name) {
    console.log("Adding new network to catalog. Id: %s, Name: %s", id, name);
    return service.getNetworksCatalog()
           .then(function (retrievedNetworks) {
             var newNetwork = {
               id: id,
               name: name,
               readOnly: true,
               selected: false,
               children: []
             };
             retrievedNetworks.push(newNetwork);
             console.log("Added new network in staging array");
             console.log(retrievedNetworks);
             retrievedNetworks.sort(function (a, b) {
               return a.name - b.name;
             });
             console.log("Re-sorted networks by name...");
             console.log(retrievedNetworks);
           });
  };

  service.findOrCreateNetworkFromCatalog = function(newNode) {
      var networkFromCatalog = undefined;

      if (newNode.network.addNew) {
        var newNetworkId = service.create_UUID();
        return service.addNetworkToCatalog(newNetworkId, newNode.network.newName);
      } else {
        function handleExistingNetworkRetrieval(retrievedNetwork) {
          console.log("Retrieved existing network with id %s", newNode.network.newName);
          return retrievedNetwork;
        }
        return service.getNetworkFromCatalogById(newNode.network.id)
        .then(handleExistingNetworkRetrieval);
      }

      return;
  };


  /**
    * Simulations Management
    */
  service.getSimulationsForNetworkFromCatalog = function(network) {
    console.info("Retrieving simulations for network id: %s", network.id);

    function handleNetworksRetrievedAndExtractSimulations(retrievedNetworkById) {
      var simulationsForNetwork = retrievedNetworkById.children;
      console.log("Found %d simulations for network id %s", simulationsForNetwork.length, network.id);
      console.log(simulationsForNetwork);
      return simulationsForNetwork;
    }

    return service.getNetworkFromCatalogById(network.id)
           .then(handleNetworksRetrievedAndExtractSimulations);
  };

  service.getSimulationForNetworkFromCatalogById = function(network, simulation) {
    console.log("Retrieving simulations from catalog for network id %s and simulation id %s",
      network.id, simulation.id);

    function handleSimulationsRetrieveAndFindMatchingSimulation(retrievedSimulationsForNetwork) {
      var matchingSimulation = undefined;

      for (var indexForRetrievedSimulations = 0; i < retrievedSimulationsForNetwork.length;
            indexForRetrievedSimulations++) {
        var currentSimulation = retrievedSimulationsForNetwork[indexForRetrievedSimulations];
        if (currentSImulation.id === simulation.id) {
          matchingSimulation = currentSimulation;
          break;
        }
      }

      return matchingSimulation;
    }

    return service.getSimulationsForNetworkFromCatalog(network)
           .then(handleSimulationsRetrieveAndFindMatchingSimulation);
  };


  /**
    * LiveNetworkData Management
    */
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


  /**
    * Nodes Management
    */
  service.addSingleNode = function(newNode) {
      // Get Network
      return service.findOrCreateNetworkFromCatalog(newNode)
        .then(function (networkFromCatalog) {
          console.log("Adding node with network id: %s", networkFromCatalog.id);

          // Get Node Type
          service.findOrCreateNodeTypeFromCatalog(newNode)
          .then(function (nodeTypeFromCatalog) {
            service.findOrCreateNodeTypeFromCatalog(newNode);
            console.log("Adding node with node type %s", nodeTypeFromCatalog);
          });
        });

/*
      // Get Simulation
      var simulationFromCatalog =
        service.findOrCreateSimulationFromCatalog(newNode.simulation.id, newNode.simulation.newName);
*/


/*
      service.addNodeToLiveNetworkData(networkFromCatalog, simulationFromCatalog,
                                                     nodeTypeFromCatalog, newNode);
                                                     */
  };
/*
  service.findOrCreateSimulationFromCatalog = function(simulationId, newSimulationName) {
      var simulationFromCatalog = service.getSimulationFromCatalogById(simulationId);
      if (simulationFromCatalog == null) {
        var newSimulationId = service.create_UUID();
        simulationFromCatalog = service.addSimulationToCatalog(newSimulationId, newSimulationName);
      }
      return simulationFromCatalog;
  };


  */

  /**
    * Old implementation for Live Network Management
    */
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
