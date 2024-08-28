package com.ericsson.tools.pm.filecollectionverification.reports.fls.controllers;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsMismatchingRecordsReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsBaseReportResponse;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsMismatchFinderReportOutputRow;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.FlsMismatchFinderAsyncService;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.FlsMismatchFinderService;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.FlsReportResponseWrapper;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.ResponseTracker;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.ResponseTrackerRepository;
import com.opencsv.CSVWriter;
import com.opencsv.bean.ColumnPositionMappingStrategy;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
import com.opencsv.exceptions.CsvException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.UUID;


@RestController
@RequestMapping("/reports/fls")
public class FlsMismatchRecordReportController {

    private Logger logger = LoggerFactory.getLogger(FlsMismatchRecordReportController.class);

    @Resource
    private FlsReportResponseWrapper flsReportResponseWrapper;

    @Resource
    private FlsMismatchFinderService flsMismatchFinderService;

    @Resource
    private FlsMismatchFinderAsyncService flsMismatchFinderAsyncService;

    @Resource
    private ResponseTrackerRepository responseTrackerRepository;

    @PostMapping(value = "/mismatchfinder")
    public FlsBaseReportResponse findAll(@RequestBody() FlsMismatchingRecordsReportRequest flsMismatchingRecordsReportRequest) {

        logger.info("Received request: {}", flsMismatchingRecordsReportRequest);

        FlsBaseReportResponse flsBaseReportResponse =
                flsReportResponseWrapper.wrap(flsMismatchingRecordsReportRequest,
                    flsMismatchFinderService.findAll(flsMismatchingRecordsReportRequest));
        return flsBaseReportResponse;
    }

    @PostMapping(value = "/mismatchfinder/async")
    public ResponseTracker findAllAsync(@RequestBody() FlsMismatchingRecordsReportRequest flsMismatchingRecordsReportRequest) {

        logger.info("Received request for async report for FLS mismatching records: {}", flsMismatchingRecordsReportRequest);

        ResponseTracker responseTracker = new ResponseTracker();
        responseTracker.setTrackerId(UUID.randomUUID().toString());
        responseTracker.setFlsBaseReportRequest(flsMismatchingRecordsReportRequest);

        responseTrackerRepository.addTracker(responseTracker);

        flsMismatchFinderAsyncService.findAll(flsMismatchingRecordsReportRequest, responseTracker);

        logger.info("Report is being generated. Returning tracker id to client: {}", responseTracker.getTrackerId());

        return responseTracker;
    }

    @GetMapping(value = "/mismatchfinder/async/track")
    public ResponseTracker getResponse(@RequestParam() String trackerId) {
        final ResponseTracker responseTracker =
                responseTrackerRepository.getTrackerIfReportGenerationIsComplete(trackerId);
        return responseTracker;
    }

    @GetMapping(value = "/mismatchfinder/async/track/csv", produces = "text/csv")
    public void getResponseAsCsv(HttpServletResponse response, @RequestParam() String trackerId) throws IOException {

        ResponseTracker responseTracker = this.getResponse(trackerId);

        if (responseTracker.isRequestCompleted()) {
            this.writeRecords(response.getWriter(), responseTracker);
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
        }
    }

    public void writeRecords(PrintWriter writer, ResponseTracker responseTracker)  {

        try {

            ColumnPositionMappingStrategy mappingStrategy =
                    new ColumnPositionMappingStrategy();
            mappingStrategy.setType(FlsMismatchFinderReportOutputRow.class);
            String headers = "EXPECTED NODE NAME, EXPECTED DATA TYPE, EXPECTED ROP START TIME (MILLIS)," +
                    "EXPECTED ROP END TIME (MILLIS), EXPECTED ROP START TIME, EXPECTED ROP END TIME," +
                    "EXPECTED NUM FILES, ACTUAL NUM FILES\n";
            String[] columns = new String[]{
                    "expectedNodeName", "expectedDataType",
                    "expectedRopStartTimeInMillis", "expectedRopEndTimeInMillis",
                    "expectedRopStartTimeFormatted", "expectedRopEndTimeFormatted",
                    "expectedNumFiles", "numFiles"};
            mappingStrategy.setColumnMapping(columns);

            StatefulBeanToCsv btcsv = new StatefulBeanToCsvBuilder(writer)
                    .withQuotechar(CSVWriter.NO_QUOTE_CHARACTER)
                    .withMappingStrategy(mappingStrategy)
                    .withSeparator(',')
                    .build();

            writer.write(headers);
            btcsv.write(responseTracker.getFlsBaseReportResponse().getRecords());

        } catch (CsvException ex) {
            logger.error("Error mapping Bean to CSV", ex);
        }
    }
}
