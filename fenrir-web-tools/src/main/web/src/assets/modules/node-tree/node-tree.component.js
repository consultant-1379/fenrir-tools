var nodeTreeModule = angular.module('nodeTree');
nodeTreeModule.component('nodeTree', {
    templateUrl: 'assets/modules/node-tree/node-tree.template.html',
    controller: ["$scope", "nodeStoreStagedService", function NodeTreeController($scope, nodeStoreStagedService) {
        $scope.nodeStoreStagedService = nodeStoreStagedService;
        $scope.selectedItem2 = {}
        $scope.CustomCallback = function(item, selectedItems) {
            if (selectedItems !== undefined && selectedItems.length >= 10000) {
                return false;
            } else {
                return true;
            }
        };
        $scope.hello = function() {
            alert('hello from NodeTreeController' + nodeStoreService.data);
        };
        $scope.getLiveNetworkData = function() {
            return nodeStoreService.getLiveNetworkData();
        };
    }]
});
