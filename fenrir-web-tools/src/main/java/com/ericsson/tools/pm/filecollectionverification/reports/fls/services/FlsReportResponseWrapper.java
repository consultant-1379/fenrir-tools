package com.ericsson.tools.pm.filecollectionverification.reports.fls.services;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsBaseReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsBaseReportResponse;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.ReportOutputRecord;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FlsReportResponseWrapper {

    public FlsBaseReportResponse wrap(FlsBaseReportRequest flsBaseReportRequest,
                                      List<? extends ReportOutputRecord> recordsFound) {
        FlsBaseReportResponse flsBaseReportResponse = new FlsBaseReportResponse();
        flsBaseReportResponse.setMaxRecordsToRetrieve(flsBaseReportRequest.getMaxRecordsToRetrieve());
        flsBaseReportResponse.setMaxRecordsRetrieved(recordsFound.size());
        flsBaseReportResponse.setRecords(recordsFound);
        if (flsBaseReportResponse.getMaxRecordsRetrieved() == flsBaseReportRequest.getMaxRecordsToRetrieve()) {
            flsBaseReportResponse.setMaxRecordsRetrievedMessage("Warning: Probably the limit was reached for the number of records retrieved. Please refine your search criteria.");
        }
        return flsBaseReportResponse;
    }
}
