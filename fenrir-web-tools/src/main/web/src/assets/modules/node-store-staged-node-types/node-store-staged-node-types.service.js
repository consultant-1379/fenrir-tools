var nodeStoreStagedNodeTypesModule = angular.module("nodeStoreStagedNodeTypes");
nodeStoreStagedNodeTypesModule.factory("nodeStoreStagedNodeTypesService", function(nodeStoreStagedService) {
    var service = {};
    // Node Types Management
    service.getNodeTypesCatalog = function() {
        return nodeStoreStagedService.data.registeredNodeTypes;
    };
    service.findOrCreateNodeType = function(newNode) {
        var nodeTypeFromCatalog = null;
        if (newNode.nodeType.addNew) {
            nodeTypeFromCatalog = service.addNodeType(newNode.nodeType.newName);
        } else {
            nodeTypeFromCatalog = service.getNodeTypeFromCatalog(newNode.nodeType.name);
        }
        return nodeTypeFromCatalog;
    };
    service.addNodeType = function(nodeType) {
        var indexForExistingNodeType = service.getNodeTypeIndexFromCatalog(nodeType);
        if (indexForExistingNodeType == -1) {
            nodeStoreStagedService.data.registeredNodeTypes.push(nodeType);
            nodeStoreStagedService.data.registeredNodeTypes.sort();
        }
        return service.getNodeTypeFromCatalog(nodeType);
    };
    service.getNodeTypeFromCatalog = function(nodeType) {
        var indexForExistingNodeType = service.getNodeTypeIndexFromCatalog(nodeType);
        if (indexForExistingNodeType > -1) {
            return nodeStoreStagedService.data.registeredNodeTypes[indexForExistingNodeType];
        }
        return null;
    };
    service.getNodeTypeIndexFromCatalog = function(nodeType) {
        for (var nodeTypeIndex = 0; nodeTypeIndex < service.getNodeTypesCatalog().length; nodeTypeIndex++) {
            if (service.getNodeTypesCatalog()[nodeTypeIndex] === nodeType) {
                return nodeTypeIndex;
            }
        }
        return -1;
    };
    return service;
});