var nodeStoreStagedSimulationsModule = angular.module("nodeStoreStagedSimulations");
nodeStoreStagedSimulationsModule.factory("nodeStoreStagedSimulationsService", function(nodeStoreStagedNetworksService, nodeStoreStagedCommonService) {
    var service = {};
    // Simulations Management
    service.getSimulationsForNetworkId = function(networkId) {
        var simulationsForNetwork = [];
        var matchingNetworks = nodeStoreStagedNetworksService.getNetworkFromCatalogById(networkId);
        if (matchingNetworks != null) {
            simulationsForNetwork = matchingNetworks.children;
        }
        return simulationsForNetwork;
    };

    service.getSimulationFromCatalogByNetworkIdAndSimulationId = function(networkId, simulationId) {
        var matchingSimulation = null;
        var simulationsForNetworkId = service.getSimulationsForNetworkId(networkId);
        for (var indexForSimulation = 0; indexForSimulation < simulationsForNetworkId.length; indexForSimulation++) {
            if (simulationsForNetworkId[indexForSimulation].id === simulationId) {
                matchingSimulation = simulationsForNetworkId[indexForSimulation];
                break;
            }
        }
        return matchingSimulation;
    };

    service.getSimulationFromCatalogByNetworkIdAndSimulationName = function(networkId, simulationName) {
        var matchingSimulation = null;
        var simulationsForNetworkId = service.getSimulationsForNetworkId(networkId);
        for (var indexForSimulation = 0; indexForSimulation < simulationsForNetworkId.length; indexForSimulation++) {
            if (simulationsForNetworkId[indexForSimulation].name === simulationName) {
                matchingSimulation = simulationsForNetworkId[indexForSimulation];
                break;
            }
        }
        return matchingSimulation;
    };

    service.findOrCreateSimulationForNetworkId = function(networkId, newNode) {
        var simulationFromCatalog = null;

        if (newNode.overridingSimulation) {
            // If overriding the simulation, try to find it by name first to see if it exists
            simulationFromCatalog =
                service.getSimulationFromCatalogByNetworkIdAndSimulationName(networkId,
                    newNode.overridingSimulation.name);
            if (simulationFromCatalog == null) {
                simulationFromCatalog = service.createAndAddNewSimulation(networkId, newNode.overridingSimulation.name);
                return simulationFromCatalog;
            }
        } else {
            if (newNode.simulation.addNew) {
                simulationFromCatalog =
                     service.getSimulationFromCatalogByNetworkIdAndSimulationName(networkId, newNode.simulation.newName);

                if (simulationFromCatalog != null) {
                    return simulationFromCatalog;
                } else {
                    simulationFromCatalog = service.createAndAddNewSimulation(networkId, newNode.simulation.newName);
                    return simulationFromCatalog;
                }
            }

            if (newNode.simulation.id != '') {
                simulationFromCatalog =
                    service.getSimulationFromCatalogByNetworkIdAndSimulationId(newNode.network.id,
                    newNode.simulation.id);
                return simulationFromCatalog;
            }
        }

        return simulationFromCatalog;
    };

    service.createAndAddNewSimulation = function(networkId, newSimulationName) {
        var newSimulationId = nodeStoreStagedCommonService.create_UUID();
        var simulationFromCatalog = service.addSimulationForNetworkId(networkId, newSimulationId, newSimulationName);
        return simulationFromCatalog;
    };

    service.addSimulationForNetworkId = function(networkId, simulationId, simulationName) {
        var simulationsForNetwork = service.getSimulationsForNetworkId(networkId);
        simulationsForNetwork.push({
            id: simulationId,
            name: simulationName,
            type: "SIMULATION",
            readOnly: false,
            selected: false,
            children: []
        });
        service.sortSimulationsArray(simulationsForNetwork);
        return service.getSimulationFromCatalogByNetworkIdAndSimulationId(networkId, simulationId);
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
        for (var i = 0; i < service.simulations.length; i++) {
            if (service.simulations[i].id === id) {
                return i;
            }
        }
        return -1;
    };
    service.getSimulationIndexFromCatalogByName = function(name) {
        for (var i = 0; i < service.simulations.length; i++) {
            if (service.simulations[i].name === name) {
                return i;
            }
        }
        return -1;
    };
    service.sortSimulationsArray = function(simulationsForNetwork) {
        simulationsForNetwork.sort(function(a, b) {
            return a.name - b.name;
        });
    };
    return service;
});
