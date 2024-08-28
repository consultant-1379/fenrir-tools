function FileCollectionVerificationController($scope, $mdDialog) {
    var ctrl = this;
    var originatorEv;
    ctrl.openMenu = function($mdMenu, ev) {
        originatorEv = ev;
        $mdMenu.open(ev);
        console.log("Clicked");
    };
    ctrl.showDialog = function($event, templateUrl, selectedScript) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: templateUrl,
            locals: {
                selectedScript: selectedScript
            },
            controller: FileCollectionVerificationDialogController,
            bindToController: true,
            clickOutsideToClose: true,
            multiple: true,
            fullscreen: true
        });
    }
}

function FileCollectionVerificationDialogController($rootScope, $scope, $mdDialog, $http, $interval, nodeStoreService,
    nodeStoreStagedNodeTypesService, nodeStoreStagedNetworksService, nodeStoreStagedSimulationsService, nodeStoreStagedSelectedService,
    selectedScript) {
    var ctrl = this;
    ctrl._mdDialog = $mdDialog;
    $scope.nodeStoreStagedNodeTypesService = nodeStoreStagedNodeTypesService;
    $scope.nodeStoreStagedNetworksService = nodeStoreStagedNetworksService;
    $scope.nodeStoreStagedSimulationsService = nodeStoreStagedSimulationsService;
    $scope.nodeStoreStagedSelectedService = nodeStoreStagedSelectedService;
    var slimmedSelectedLiveNodes = $scope.nodeStoreStagedSelectedService.getSlimmedSelectedLiveNodesData();
    var startOfToday = new Date();
    startOfToday.setHours(0);
    startOfToday.setMinutes(0);
    startOfToday.setSeconds(0);
    startOfToday.setMilliseconds(0);
    var startOfTomorrow = new Date(startOfToday.getTime() + 86400000);
    $scope.report = {
        status: {
            loading: false,
            loaded: false,
            message: '',
            isInError: false,
            response: undefined,
            tracker: {
                trackerId: ""
            }
        },
        output: {
            data: [],
            currentPage: 1,
            pageLimit: 10,
            maxRecordsToRetrieve: -1,
            maxRecordsRetrieved: -1,
            maxRecordsRetrievedMessage: ''
        },
        common: {
            catalogs: {
                availableDataTypes: ["PM_CELLTRACE", "PM_CELLTRACE_CUCP", "PM_CELLTRACE_CUUP", "PM_CELLTRACE_DU", "PM_STATISTICAL", "PM_UETRACE"]
            },
            inputParams: {
                maxRecordsToRetrieveEnabled: false,
                maxRecordsToRetrieve: 100000,
                ropStartTime: startOfToday,
                ropEndTime: startOfTomorrow,
                dataTypes: [],
                selectedLiveNodes: slimmedSelectedLiveNodes
            }
        },
        flsdups: {
            inputParams: {
                maxFilesExpected: 1
            }
        },
        flsmismatch: {
            inputParams: {
                availableRopIntervalInMinutes: [1, 15],
                selectedRopIntervalInMinutes: 15,
                selectedDataType: "PM_STATISTICAL",
                dataTypesAndExpectedRecords: [],
                showOnlyMismatchingRecords: true
            },
            config: {
                generateReportUrl: "/reports/fls/mismatchfinder/async",
                trackingUrl: "/reports/fls/mismatchfinder/async/track",
                trackingUrlCsv: "/reports/fls/mismatchfinder/async/track/csv",
                csvDownloadFileName: "mismatch_report.csv"
            }
        },
        flsSimpleQuery: {
            inputParams: {
                ropTimeSearchCriteriaEnabled: true,
                fileCreationTimeSearchCriteriaEnabled: false,
                fileCreationStartTime: startOfToday,
                fileCreationEndTime: startOfTomorrow,
                nodeNameSearchCriteriaEnabled: false,
                nodeNameSearchCriteriaOperator: "LIKE",
                nodeName: "",
                nodeTypesSearchCriteriaEnabled: false,
                nodeTypes: [],
                dataTypesSearchCriteriaEnabled: true,
                dataTypesSelectedItem: "",
                dataTypesSearchText: ""
            }
        }
    };
    ctrl.resetReportState = function() {
        $scope.report.status.message = "";
        $scope.report.status.isInError = false;
        $scope.report.status.loaded = false;
        $scope.report.status.loading = true;
        $scope.report.output.data = [];
        $scope.report.output.currentPage = 1;
        $scope.report.output.maxRecordsToRetrieve = -1;
        $scope.report.output.maxRecordsRetrieved = -1;
        $scope.report.output.maxRecordsRetrievedMessage = '';
    };
    ctrl.setReportStateOnError = function(error) {
        console.error("Could not load report");
        $scope.report.status.loaded = true;
        $scope.report.status.loading = false;
        $scope.report.status.message = "Could not load report";
        $scope.report.status.isInError = true;
        $scope.report.status.response = error.data;
        $scope.report.output.data = [];
    };
    ctrl.setReportStateOnSuccess = function(response) {
        console.log("Received response from server");
        $scope.report.output.data = response.data.records;
        $scope.report.output.maxRecordsToRetrieve = response.data.maxRecordsToRetrieve;
        $scope.report.output.maxRecordsRetrieved = response.data.maxRecordsRetrieved;
        $scope.report.output.maxRecordsRetrievedMessage = response.data.maxRecordsRetrievedMessage;
        $scope.report.status.loaded = true;
        $scope.report.status.loading = false;
    };
    ctrl.setReportStateOnSuccessDownloadCsv = function(response) {
        console.log("Received response from server");
        ctrl.resetReportState();
        $scope.report.status.loading = false;
    };
    ctrl.setReportStateOnSuccessFromTrackerResponse = function(response) {
        console.log("Received tracker response from server");
        $scope.report.output.data = response.data.flsBaseReportResponse.records;
        $scope.report.output.maxRecordsToRetrieve = response.data.flsBaseReportResponse.maxRecordsToRetrieve;
        $scope.report.output.maxRecordsRetrieved = response.data.flsBaseReportResponse.maxRecordsRetrieved;
        $scope.report.output.maxRecordsRetrievedMessage = response.data.flsBaseReportResponse.maxRecordsRetrievedMessage;
        $scope.report.status.loaded = true;
        $scope.report.status.loading = false;
    }
    $scope.dataTypeTransformChip = function(chip) {
        var dataTypeAlreadyAdded = false;
        if (typeof $scope.report.flsmismatch.inputParams.dataTypesAndExpectedRecords === "undefined") {
            $scope.report.flsmismatch.inputParams.dataTypesAndExpectedRecords = [];
        }
        $scope.report.flsmismatch.inputParams.dataTypesAndExpectedRecords.forEach(function(element) {
            if (element.dataType === $scope.report.flsmismatch.inputParams.selectedDataType) {
                dataTypeAlreadyAdded = true;
            }
        });
        if (dataTypeAlreadyAdded) {
            return null;
        } else {
            return {
                dataType: $scope.report.flsmismatch.inputParams.selectedDataType,
                expectedRecords: chip
            };
        }
    };
    $scope.dataTypesAndExpectedRecordsOnRemove = function($chip, $index, $event) {
        console.log("Removing: " + $chip);
        console.log("$scope.report.flsmismatch.inputParams.dataTypesAndExpectedRecords=");
        console.log($scope.report.flsmismatch.inputParams.dataTypesAndExpectedRecords);
    };
    $scope.flsDataTypeQuerySearch = function(dataTypesSearchText) {
        var matchingFlsDataTypes = [];
        $scope.report.common.catalogs.availableDataTypes.forEach(function(elem) {
            if (elem.toUpperCase().includes(dataTypesSearchText.toUpperCase())) {
                matchingFlsDataTypes.push(elem);
            }
        });
        return matchingFlsDataTypes;
    };
    $scope.cancelOrClose = function() {
        $mdDialog.hide();
    };
    $scope.viewFlsRecordDetails = function(flsRecord) {
        $mdDialog.show({
            templateUrl: "assets/modules/file-collection-verification/view-fls-record-details.template.html",
            preserveScope: true,
            autoWrap: true,
            multiple: true,
            locals: {
                flsRecord: flsRecord
            },
            controller: function($scope, $mdDialog, flsRecord) {
                $scope.flsRecord = flsRecord;
                this.closeViewFlsRecordDetailsDialog = function() {
                    $mdDialog.hide();
                }
            },
            controllerAs: "flsViewCtrl",
            bindToController: true
        });
    };
    $scope.generateFlsDupsReport = function() {
        $http.post("/reports/fls/dupsfinder", {
            maxRecordsToRetrieve: $scope.report.common.inputParams.maxRecordsToRetrieve,
            dataTypes: $scope.report.common.inputParams.dataTypes,
            ropStartTimeInMillis: $scope.report.common.inputParams.ropStartTime.getTime(),
            ropEndTimeInMillis: $scope.report.common.inputParams.ropEndTime.getTime(),
            selectedLiveNodes: $scope.report.common.inputParams.selectedLiveNodes,
            maxFilesExpected: $scope.report.flsdups.inputParams.maxFilesExpected
        }).then(function(response) {
            ctrl.setReportStateOnSuccess(response);
        }).catch(function(error) {
            ctrl.setReportStateOnError(error);
        });
        ctrl.resetReportState();
        console.log("Sent HTTP request to retrieve FLS dups report");
    };
    ctrl.startTrackingReportResponse = function(trackingUrl, response) {
        $scope.report.status.tracker.trackerId = response.data.trackerId;

        function trackReportRequest() {
            $http.get(trackingUrl, {
                params: {
                    trackerId: $scope.report.status.tracker.trackerId
                }
            }).then(function(trackerResponse) {
                if (trackerResponse.data.requestCompleted) {
                    ctrl.setReportStateOnSuccessFromTrackerResponse(trackerResponse);
                    $interval.cancel(trackerIntervalResponse);
                    console.log("Cancelled interval");
                }
            }).catch(function(error) {
                console.error("Error while tracking request");
                console.error(error);
                $interval.cancel(trackerIntervalResponse);
                console.log("Cancelled interval");
                ctrl.setReportStateOnError(error);
            });
        }
        var trackerIntervalResponse = $interval(trackReportRequest, 2000);
    }
    ctrl.startTrackingReportResponseForDownload = function(trackingUrl, csvDownloadFileName, response) {
        $scope.report.status.tracker.trackerId = response.data.trackerId;
        if ($scope.report.flsSimpleQuery.inputParams.ropTimeSearchCriteriaEnabled) {
            csvDownloadFileName = ctrl.generateCsvDownloadFileNameWithRopTimes(csvDownloadFileName, $scope.report.common.inputParams.ropStartTime,
                $scope.report.common.inputParams.ropEndTime);
        }

        function trackReportRequestWithDownload() {
            $http.get(trackingUrl, {
                params: {
                    trackerId: $scope.report.status.tracker.trackerId
                },
                headers: {
                    "Accept": "text/csv"
                },
                responseType: 'arraybuffer'
            }).then(function(response) {
                if (response.status == 200) {
                    $interval.cancel(trackerIntervalResponse);
                    console.log("Cancelled interval");
                    ctrl.setReportStateOnSuccessDownloadCsv();
                    var filename = csvDownloadFileName;
                    var contentType = "text/csv";
                    var linkElement = document.createElement('a');
                    try {
                        var blob = new Blob([response.data], {
                            type: contentType
                        });
                        var url = window.URL.createObjectURL(blob);
                        linkElement.setAttribute('href', url);
                        linkElement.setAttribute("download", filename);
                        var clickEvent = new MouseEvent("click", {
                            "view": window,
                            "bubbles": true,
                            "cancelable": false
                        });
                        linkElement.dispatchEvent(clickEvent);
                    } catch (ex) {
                        console.log(ex);
                    }
                    console.log("Downloaded file");
                } else if (response.status == 202) {
                    console.log("Waiting for CSV to be ready");
                }
            }).catch(function(error) {
                console.error("Error while tracking request");
                console.error(error);
                $interval.cancel(trackerIntervalResponse);
                console.log("Cancelled interval");
                ctrl.setReportStateOnError(error);
            });
        }
        var trackerIntervalResponse = $interval(trackReportRequestWithDownload, 10000);
    }
    ctrl.generateCsvDownloadFileNameWithRopTimes = function(csvDownloadFileName, ropStartTime, ropEndTime) {
        var csvDownloadFileNamePrefix = csvDownloadFileName.substring(0, csvDownloadFileName.indexOf("."));
        var csvDownloadFileExtension = csvDownloadFileName.substring(csvDownloadFileName.indexOf("."));
        var csvDownloadFileNameRopStartTime = "ROPStartTime_" + ctrl.formatDateForCsvDownload(ropStartTime);
        var csvDownloadFileNameRopEndTime = "ROPEndTime_" + ctrl.formatDateForCsvDownload(ropEndTime);
        return csvDownloadFileNamePrefix + "_" + (new Date().getTime()) + "_" + csvDownloadFileNameRopStartTime + "_-_" +
            csvDownloadFileNameRopEndTime + csvDownloadFileExtension;
    };
    ctrl.formatDateForCsvDownload = function(date) {
        return moment(date).format("YYYYMMDD_HHmm");
    };
    $scope.generateFlsMismatchesReport = function(reportDisplayType) {
        $http.post($scope.report.flsmismatch.config.generateReportUrl, {
            maxRecordsToRetrieve: $scope.report.common.inputParams.maxRecordsToRetrieve,
            ropStartTimeInMillis: $scope.report.common.inputParams.ropStartTime.getTime(),
            ropEndTimeInMillis: $scope.report.common.inputParams.ropEndTime.getTime(),
            ropIntervalInMinutes: $scope.report.flsmismatch.inputParams.selectedRopIntervalInMinutes,
            selectedLiveNodes: $scope.report.common.inputParams.selectedLiveNodes,
            dataTypesAndExpectedRecords: $scope.report.flsmismatch.inputParams.dataTypesAndExpectedRecords,
            showOnlyMismatchingRecords: $scope.report.flsmismatch.inputParams.showOnlyMismatchingRecords
        }).then(function(response) {
            if (reportDisplayType === "SCREEN") {
                ctrl.startTrackingReportResponse($scope.report.flsmismatch.config.trackingUrl, response);
            } else if (reportDisplayType === "CSV") {
                ctrl.startTrackingReportResponseForDownload($scope.report.flsmismatch.config.trackingUrlCsv, $scope.report.flsmismatch.config
                    .csvDownloadFileName, response);
            }
        }).catch(function(error) {
            console.log("An error happened before request completed: " + new Date());
            ctrl.setReportStateOnError(error);
        });
        ctrl.resetReportState();
        console.log("Sent HTTP request to retrieve FLS mismatch report");
    };
    $scope.generateflsSimpleQueryReport = function() {
        $http.post("/reports/fls/simpleQuery", {
            maxRecordsToRetrieve: $scope.report.common.inputParams.maxRecordsToRetrieve,
            ropTimeSearchCriteriaEnabled: $scope.report.flsSimpleQuery.inputParams.ropTimeSearchCriteriaEnabled,
            ropStartTimeInMillis: $scope.report.common.inputParams.ropStartTime.getTime(),
            ropEndTimeInMillis: $scope.report.common.inputParams.ropEndTime.getTime(),
            fileCreationTimeSearchCriteriaEnabled: $scope.report.flsSimpleQuery.inputParams.fileCreationTimeSearchCriteriaEnabled,
            fileCreationStartTimeInMillis: $scope.report.flsSimpleQuery.inputParams.fileCreationStartTime.getTime(),
            fileCreationEndTimeInMillis: $scope.report.flsSimpleQuery.inputParams.fileCreationEndTime.getTime(),
            nodeNameSearchCriteriaEnabled: $scope.report.flsSimpleQuery.inputParams.nodeNameSearchCriteriaEnabled,
            nodeNameSearchCriteriaOperator: $scope.report.flsSimpleQuery.inputParams.nodeNameSearchCriteriaOperator,
            nodeName: $scope.report.flsSimpleQuery.inputParams.nodeName,
            nodeTypesSearchCriteriaEnabled: $scope.report.flsSimpleQuery.inputParams.nodeTypesSearchCriteriaEnabled,
            nodeTypes: $scope.report.flsSimpleQuery.inputParams.nodeTypes,
            dataTypesSearchCriteriaEnabled: $scope.report.flsSimpleQuery.inputParams.dataTypesSearchCriteriaEnabled,
            dataTypes: $scope.report.common.inputParams.dataTypes,
            selectedLiveNodes: $scope.report.common.inputParams.selectedLiveNodes
        }).then(function(response) {
            ctrl.setReportStateOnSuccess(response);
        }).catch(function(error) {
            ctrl.setReportStateOnError(error);
        });
        ctrl.resetReportState();
        console.log("Sent HTTP request to retrieve FLS basic query report");
    };
    $scope.downloadAsCsv = function() {
        alert("Not implemented!!!");
    };
    ctrl.$onInit = function() {
        console.log("Initialising controller for report");
    };
}
angular.module('fileCollectionVerification').
component('fileCollectionVerification', {
    templateUrl: 'assets/modules/file-collection-verification/file-collection-verification.template.html',
    controller: FileCollectionVerificationController
});
