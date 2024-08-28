var nodeStoreStagedModule = angular.module("nodeStoreStaged");
nodeStoreStagedModule.factory("nodeStoreStagedService", function($q, nodeStorePersistedService) {
    var service = {
        init: {
            deferredService: $q.defer()
        },
        data: {}
    };

    function handleError(error) {
        service.deferredService.reject("Could not initialise nodeStoreStaged service successfully");
    }

    function initialiseStagedData() {
        var persistedNetworks = undefined;
        var persistedRegisteredNodeTypes = undefined;
        nodeStorePersistedService.getLiveNetworkData().then(function(retrievedLiveNetworkData) {
            persistedNetworks = retrievedLiveNetworkData.networks;
            console.log("Staged networks data");
            console.log(persistedNetworks);
            return nodeStorePersistedService.getNodeTypesCatalog();
        }).then(function(retrievedRegisteredNodeTypes) {
            persistedRegisteredNodeTypes = retrievedRegisteredNodeTypes.registeredNodeTypes;
            console.log("Staged registered node types data");
            console.log(persistedRegisteredNodeTypes);
            service.data = {
                networks: persistedNetworks,
                registeredNodeTypes: persistedRegisteredNodeTypes
            };
            service.init.deferredService.resolve("Service nodeStoreStaged was initialised successfully");
        });
    }
    nodeStorePersistedService.init.deferredService.promise.then(initialiseStagedData);
    return service;
});