var nodeStoreStagedNetworksModule = angular.module("nodeStoreStagedNetworks");
nodeStoreStagedNetworksModule.factory("nodeStoreStagedNetworksService", function(nodeStoreStagedService, nodeStoreStagedCommonService) {
    var service = {};
    // Networks Catalog Management
    service.getNetworksCatalog = function() {
        return nodeStoreStagedService.data.networks;
    };
    service.findOrCreateNetwork = function(newNode) {
        var networkFromCatalog = null;

        if (newNode.overridingNetwork) {
          // If overriding the network or requesting to create a new network
          networkFromCatalog = service.getNetworkFromCatalogByName(newNode.overridingNetwork.name);

          if (networkFromCatalog == null) {
              networkFromCatalog = service.createAndAddNewNetwork(newNode.overridingNetwork.name);
              return networkFromCatalog;
          }
        }
        if (networkFromCatalog == null) {
             if (newNode.network.addNew) {
                 networkFromCatalog = service.getNetworkFromCatalogByName(newNode.network.newName);
                 if (networkFromCatalog != null) {
                     return networkFromCatalog;
                 } else {
                     networkFromCatalog = service.createAndAddNewNetwork(newNode.network.newName);
                     return networkFromCatalog;
                 }
             }

             if (networkFromCatalog == null && newNode.network.id != '') {
                 networkFromCatalog = service.getNetworkFromCatalogById(newNode.network.id);
                 return networkFromCatalog;
             }
        }

        return networkFromCatalog;
    };

    service.createAndAddNewNetwork = function(networkName) {
        var newNetworkId = nodeStoreStagedCommonService.create_UUID();
        var networkFromCatalog = service.addNetwork(newNetworkId, networkName);
        return networkFromCatalog;
    };

    service.addNetwork = function(id, name) {
        var indexForExistingNetwork = service.getNetworkIndexFromCatalogById(id);
        if (indexForExistingNetwork == -1) {
            nodeStoreStagedService.data.networks.push({
                id: id,
                name: name,
                type: "NETWORK",
                readOnly: false,
                selected: false,
                children: []
            });
            service.sortNetworks();
        }
        return service.getNetworkFromCatalogById(id);
    };
    service.getNetworkFromCatalogById = function(id) {
        var indexForExistingNetwork = service.getNetworkIndexFromCatalogById(id);
        if (indexForExistingNetwork > -1) {
            return nodeStoreStagedService.data.networks[indexForExistingNetwork];
        }
        return null;
    };
    service.getNetworkFromCatalogByName = function(name) {
        var indexForExistingNetwork = service.getNetworkIndexFromCatalogByName(name);
        if (indexForExistingNetwork > -1) {
            return nodeStoreStagedService.data.networks[indexForExistingNetwork];
        }
        return null;
    };
    service.getNetworkIndexFromCatalogById = function(id) {
        for (var i = 0; i < nodeStoreStagedService.data.networks.length; i++) {
            if (nodeStoreStagedService.data.networks[i].id === id) {
                return i;
            }
        }
        return -1;
    };
    service.getNetworkIndexFromCatalogByName = function(name) {
        for (var i = 0; i < nodeStoreStagedService.data.networks.length; i++) {
            if (nodeStoreStagedService.data.networks[i].name === name) {
                return i;
            }
        }
        return -1;
    };
    service.sortNetworks = function() {
        var networksArraySortedByName = nodeStoreStagedService.data.networks.slice(0);
        networksArraySortedByName.sort(function(a, b) {
            return a.name - b.name;
        });
        nodeStoreStagedService.data.networks = networksArraySortedByName;
    };
    return service;
});
