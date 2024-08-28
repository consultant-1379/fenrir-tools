var nodeStoreStagedCommonModule = angular.module("nodeStoreStagedNodes");
nodeStoreStagedCommonModule.factory("nodeStoreStagedNodesService", function(nodeStoreStagedCommonService) {
    var service = {};
    service.attachNodeToSimulation = function(simulationFromCatalog, nodeTypeFromCatalog, newNode) {
        var newNodeToSave = {
            id: nodeStoreStagedCommonService.create_UUID(),
            name: newNode.node.name,
            type: "NODE",
            children: [],
            selected: false,
            ip: newNode.node.ip,
            neType: nodeTypeFromCatalog
        };
        simulationFromCatalog.children.push(newNodeToSave);
        service.sortNodesInSimulation(simulationFromCatalog);
        return newNodeToSave;
    };
    service.sortNodesInSimulation = function(simulationFromCatalog) {
        simulationFromCatalog.children.sort(function(a, b) {
            return a.name - b.name;
        });
    };
    return service;
});