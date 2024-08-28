var nodeStoreDbModule = angular.module("nodeStoreDb");
nodeStoreDbModule.factory("nodeStoreDbService", function($q, pouchDB) {
    var service = {
        config: {
            DB_NAME: "nodeStoreDb",
            DEV_MODE: false
        },
        init: {
            deferredService: $q.defer()
        }
    };

    function init() {
        createDatabase();
        if (service.config.DEV_MODE) {
            destroyAndRecreateDatabase()
        } else {
            service.init.deferredService.resolve("Database ' " + service.config.DB_NAME + "' instantiated or created");
        }
    }

    function createDatabase() {
        //service.db = new PouchDB(service.DB_NAME);
        service.db = pouchDB(service.config.DB_NAME)
        console.log("Database ' " + service.config.DB_NAME + "' instantiated or created");
        console.log(service.db);
    }

    function destroyAndRecreateDatabase() {
        function handleErrorCreatingDatabase(error) {
            console.log(error);
            service.init.deferredService.reject("An error occurred while destroying the database %s", service.config.DB_NAME);
        }

        function handleDatabaseDestroyedResponse(databaseDestroyedResponse) {
            console.log("Database '%s' destroyed", service.config.DB_NAME);
            return databaseDestroyedResponse;
        }
        return service.db.destroy().then(handleDatabaseDestroyedResponse).then(function() {
            createDatabase();
            service.init.deferredService.resolve("Database ' " + service.config.DB_NAME + "' instantiated or created");
        }).catch(handleErrorCreatingDatabase);
    }
    init();
    return service;
});