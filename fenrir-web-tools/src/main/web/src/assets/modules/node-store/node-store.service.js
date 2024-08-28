var nodeStoreModule = angular.module("nodeStore");
nodeStoreModule.factory("nodeStoreService", function(nodeStorePersistedService, nodeStoreStagedService, nodeStoreStagedNodeTypesService,
    nodeStoreStagedNetworksService, nodeStoreStagedSimulationsService, nodeStoreStagedNodesService) {
    var service = {};
    // Nodes Management
    service.addSingleNode = function(newNode) {
        var newNodeAttached = service.addSingleNodeToNodeStoreStagedData(newNode);
        service.updateDatabaseForRegisteredNodeTypesAndLiveNetworkData();
        return newNodeAttached;
    };
    service.addSingleNodeToNodeStoreStagedData = function(newNode) {
        // Get Network
        var networkFromCatalog = nodeStoreStagedNetworksService.findOrCreateNetwork(newNode);
        // Get Simulation
        var simulationFromCatalog = nodeStoreStagedSimulationsService.findOrCreateSimulationForNetworkId(networkFromCatalog.id, newNode);
        // Get Node Type
        var nodeTypeFromCatalog = nodeStoreStagedNodeTypesService.findOrCreateNodeType(newNode);
        var newNodeAttached = nodeStoreStagedNodesService.attachNodeToSimulation(simulationFromCatalog, nodeTypeFromCatalog, newNode);
        return newNodeAttached;
    };
    service.addBatchOfNodes = function(nodesBatch) {
        var newNodesAttached = service.addBatchOfNodesToNodeStoreStagedData(nodesBatch);
        service.updateDatabaseForRegisteredNodeTypesAndLiveNetworkData();
        var newNodesAttached;
    };
    service.addBatchOfNodesToNodeStoreStagedData = function(nodesBatch) {
        var newNodes = nodesBatch.newNodes;
        var newNodesAttached = [];
        if (newNodes.length > 0) {
            // Get Network
            var networkFromCatalog = nodeStoreStagedNetworksService.findOrCreateNetwork(nodesBatch);
            // Get Simulation
            var simulationFromCatalog = nodeStoreStagedSimulationsService.findOrCreateSimulationForNetworkId(networkFromCatalog.id,
                nodesBatch);
            // Get Node Type
            var nodeTypeFromCatalog = nodeStoreStagedNodeTypesService.findOrCreateNodeType(nodesBatch);
            for (var i = 0; i < newNodes.length; i++) {
                var newNode = newNodes[i];
                newNodeAttached = nodeStoreStagedNodesService.attachNodeToSimulation(simulationFromCatalog, nodeTypeFromCatalog, newNode);
                newNodesAttached.push(newNodeAttached);
            }
        } else {
            console.log("No nodes were added to collection. Ignoring request.");
        }
        return newNodesAttached;
    };
    service.deleteSelectedNetworkData = function() {
        console.log("Deleting selected network data");
        return;
    };
    service.deleteAllNetworkData = function() {
        console.log("Deleting all network data");
        nodeStoreStagedService.data.networks = JSON.parse(JSON.stringify(nodeStorePersistedService.DEFAULTS.INSTANCES.LIVE_NETWORK_DATA.networks));
        service.updateDatabaseForLiveNetworkData();
        return;
    };
    service.updateDatabaseForRegisteredNodeTypes = function() {
        function handleUpdateOfRegisteredNodeTypes(updatedRegisteredNodeTypes) {
            console.log("Registered node types updated in database");
            console.log(updatedRegisteredNodeTypes);
            return updatedRegisteredNodeTypes;
        };
        return nodeStorePersistedService.updateNodeTypesCatalog(nodeStoreStagedService.data.registeredNodeTypes).then(
            handleUpdateOfRegisteredNodeTypes);
    };
    service.updateDatabaseForLiveNetworkData = function() {
        function handleUpdateOfLiveNetworkData(updatedLiveNetworkData) {
            console.log("Live network data updated in database");
            console.log(updatedLiveNetworkData);
            return updatedLiveNetworkData;
        };
        return nodeStorePersistedService.updateLiveNetworkData(nodeStoreStagedService.data.networks).then(handleUpdateOfLiveNetworkData);
    };
    service.updateDatabaseForRegisteredNodeTypesAndLiveNetworkData = function() {
        service.updateDatabaseForRegisteredNodeTypes().then(function(result) {
            return service.updateDatabaseForLiveNetworkData()
        })
    };
    return service;
});
