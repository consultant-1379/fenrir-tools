var nodeStorePersistedModule = angular.module("nodeStorePersisted");
nodeStorePersistedModule.factory("nodeStorePersistedService", function($q, nodeStoreDbService) {
    var service = {
        init: {
            internal: {
                nodeTypesInitialisedPromise: $q.defer(),
                liveNetworkDataInitialisedPromise: $q.defer()
            },
            deferredService: $q.defer()
        }
    };
    service.DEFAULTS = {
        IDS: {
            DEFAULT_NETWORK: "DEFAULT_NETWORK",
            DEFAULT_SIMULATION: "DEFAULT_SIMULATION",
            NODE_TYPES: "NODE_TYPES",
            LIVE_NETWORK_DATA: "LIVE_NETWORK_DATA"
        },
        INSTANCES: {
            LIVE_NETWORK_DATA: {
                _id: "LIVE_NETWORK_DATA",
                networks: [{
                    id: "DEFAULT_NETWORK",
                    name: 'Default Network',
                    type: "NETWORK",
                    readOnly: true,
                    selected: false,
                    children: [{
                        id: "DEFAULT_SIMULATION",
                        name: "Default Simulation",
                        type: "SIMULATION",
                        readOnly: true,
                        selected: false,
                        children: []
                    }]
                }]
            },
            NODE_TYPES: {
                _id: "NODE_TYPES",
                registeredNodeTypes: ["5GRadioNode", "RadioNode"]
            }
        }
    };
    service.DBMGMT = {
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
                            fields: ["_id", "networks.[].id"]
                        }
                    }
                }
            },
            SELECTOR: {
                NETWORK: {
                    ALL: {
                        selector: {
                            _id: service.DEFAULTS.IDS.LIVE_NETWORK_DATA
                        },
                        fields: ["networks"]
                    },
                    BY_ID: {
                        selector: {
                            "_id": service.DEFAULTS.IDS.LIVE_NETWORK_DATA,
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

    function init() {
        if (nodeStoreDbService.config.DEV_MODE) {
            console.log("DEV_MODE is ON. Catalogs were initialised in database");
        } else {
            console.log("DEV_MODE is OFF. Local client data from previous sessions will be recovered or defaults created");
        }
        initDefaultDataInDatabase();
    }

    function initDefaultDataInDatabase() {
        nodeStoreDbService.db.get(service.DEFAULTS.IDS.NODE_TYPES).then(function(defaultNodeTypesFoundResponse) {
            console.log("Node Types catalog already exists");
            service.init.internal.nodeTypesInitialisedPromise.resolve("Node Types catalog already exists");
            return defaultNodeTypesFoundResponse;
        }).catch(function(defaultNodeTypesNotFoundResponse) {
            console.info(defaultNodeTypesNotFoundResponse);
            console.info("Node Types catalog document was not found. Default will be created");
            return nodeStoreDbService.db.put(service.DEFAULTS.INSTANCES.NODE_TYPES).then(function(defaultNodeTypesCreatedResponse) {
                console.log("Persisted default node types catalog doc");
                console.log(defaultNodeTypesCreatedResponse);
                service.init.internal.nodeTypesInitialisedPromise.resolve("Persisted default node types catalog doc");
                return defaultNodeTypesCreatedResponse;
            }).catch(function(defaultNodeTypesCreationError) {
                console.error("There was an error creating default node types catalog");
                console.error(defaultNodeTypesCreationError);
                service.init.internal.nodeTypesInitialisedPromise.reject(
                    "There was an error creating default node types catalog");
                return defaultNodeTypesCreationError;
            })
        });
        nodeStoreDbService.db.get(service.DEFAULTS.IDS.LIVE_NETWORK_DATA).then(function(defaultLiveNetworkDataFoundResponse) {
            console.log("Live Network Data catalog already exists");
            service.init.internal.liveNetworkDataInitialisedPromise.resolve("Live Network Data catalog already exists");
            return defaultLiveNetworkDataFoundResponse;
        }).catch(function(defaultLiveNetworkDataNotFoundResponse) {
            console.info(defaultLiveNetworkDataNotFoundResponse);
            console.info("Live Network Data document was not found. Default will be created");
            return nodeStoreDbService.db.put(service.DEFAULTS.INSTANCES.LIVE_NETWORK_DATA).then(function(
                defaultLiveNetworkDataCreatedResponse) {
                console.log("Persisted default live network data catalog doc");
                console.log(defaultLiveNetworkDataCreatedResponse);
                service.init.internal.liveNetworkDataInitialisedPromise.resolve(
                    "Persisted default live network data catalog doc");
                return defaultLiveNetworkDataCreatedResponse;
            }).catch(function(defaultLiveNetworkDataCreationError) {
                console.error("There was an error creating default live network data catalog");
                console.error(defaultLiveNetworkDataCreationError);
                service.init.internal.liveNetworkDataInitialisedPromise.reject(
                    "There was an error creating default live network data catalog");
                return defaultLiveNetworkDataCreationError;
            });
        });
    }

    function reportInitialisationCompletedAndResolveServicePromise() {
        console.log("Initialisation completed for service nodeStorePersistedService");
        service.init.deferredService.resolve("nodeStorePersistedService is ready to serve requests");
    }
    nodeStoreDbService.init.deferredService.promise.then(function(nodeStoreDbServiceInitialised) {
        init();
        service.init.internal.nodeTypesInitialisedPromise.promise.then(function(nodeTypesInitialisedPromise) {
            service.init.internal.liveNetworkDataInitialisedPromise.promise.then(function(liveNetworkDataInitialised) {
                reportInitialisationCompletedAndResolveServicePromise();
            })
        })
    });
    /**
     * NodeTypes Management
     */
    service.getNodeTypesCatalog = function() {
        console.info("Retrieving node types catalog document from persistent storage");

        function handleError(error) {
            console.error("Could not retrieve Node types catalog document from persistent storage");
            console.error(error);
        }

        function handleNodeTypesRetrieved(retrievedNodeTypesDoc) {
            return retrievedNodeTypesDoc;
        }
        return nodeStoreDbService.db.get(service.DEFAULTS.IDS.NODE_TYPES).then(handleNodeTypesRetrieved).catch(handleError);
    }
    service.updateNodeTypesCatalog = function(updatedRegisteredNodeTypes) {
        console.log("Updating node types catalog document in persistent storage");

        function handleError(error) {
            console.error("Could not update node types catalog doc in persistent storage");
            console.error(error);
        }

        function handleRetrievedNodeTypesAndUpdate(nodeTypesDoc) {
            nodeTypesDoc.registeredNodeTypes = updatedRegisteredNodeTypes;
            return nodeStoreDbService.db.put(nodeTypesDoc).then(handleUpdateOfNodeTypesCatalog).catch(handleError)
        }

        function handleUpdateOfNodeTypesCatalog(updatedNodeTypesDoc) {
            console.log("Updated node types catalog doc in persistent storage");
            console.log(updatedNodeTypesDoc);
            return updatedNodeTypesDoc;
        }
        return service.getNodeTypesCatalog().then(handleRetrievedNodeTypesAndUpdate).catch(handleError);
    }
    /**
     * LiveNetworkData Management
     */
    service.getLiveNetworkData = function() {
        function handleError(error) {
            console.error("Could not retrieve live network data doc from persistent storage");
            console.error(error);
        }

        function handleRetrievedLiveNetworkData(retrievedLiveNetworkData) {
            console.log("Retrieved live network data from persistent storage");
            console.log(retrievedLiveNetworkData);
            return retrievedLiveNetworkData;
        }
        return nodeStoreDbService.db.get(service.DEFAULTS.IDS.LIVE_NETWORK_DATA).then(handleRetrievedLiveNetworkData).catch(handleError);
    };
    service.updateLiveNetworkData = function(updatedNetworksForLiveNetworkData) {
        return service.getLiveNetworkData().then(function(retrievedLiveNetworkData) {
            retrievedLiveNetworkData.networks = updatedNetworksForLiveNetworkData;
            return nodeStoreDbService.db.put(retrievedLiveNetworkData).then(function(updatedLiveNetworkData) {
                console.log("Updated Live Network Data");
                console.log(retrievedLiveNetworkData);
                return service.getLiveNetworkData();
            }).catch(function(error) {
                console.error("Could not retrieve live network data doc from persistent storage after update");
                console.error(error);
            });
        });
    };
    service.resetLiveNetworkDataToDefault = function() {
        service.updatedLiveNetworkData();
    };
    return service;
});