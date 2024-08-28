package com.ericsson.tools.pm.filecollectionverification.reports.fls.services;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsMismatchingRecordsReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsMismatchFinderReportOutputRow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class FlsMismatchFinderAsyncService extends FlsMismatchFinderBaseService {

    private Logger logger = LoggerFactory.getLogger(FlsMismatchFinderAsyncService.class);

    @Resource
    private FlsMismatchFinderService flsMismatchFinderService;

    @Async("asyncExecutor")
    public CompletableFuture<List<FlsMismatchFinderReportOutputRow>> findAll(FlsMismatchingRecordsReportRequest flsMismatchingRecordsReportRequest,
                                                                             ResponseTracker responseTracker) {
        long reportGenerationStartTime = System.currentTimeMillis();
        logger.info("Executing query to find mismatching FLS records. Start time: {}", new Date(reportGenerationStartTime));

        List<FlsMismatchFinderReportOutputRow> flsMismatchFinderReportOutputRowList =
                flsMismatchFinderService.findAll(flsMismatchingRecordsReportRequest);
        logger.info("Query execution completed. Found {} records", flsMismatchFinderReportOutputRowList.size());

        responseTracker.setRequestCompleted(true);
        responseTracker.setReportOutputRecordList(flsMismatchFinderReportOutputRowList);

        long reportGenerationEndTime = System.currentTimeMillis();
        double reportGenerationElapsedTime = (reportGenerationEndTime - reportGenerationStartTime) / 1000;
        logger.info("Finished creating report to find mismatching FLS records. End time: {}. Report generated in {} seconds",
                new Date(reportGenerationEndTime), reportGenerationElapsedTime);

        return CompletableFuture.completedFuture(flsMismatchFinderReportOutputRowList);
    }
}
