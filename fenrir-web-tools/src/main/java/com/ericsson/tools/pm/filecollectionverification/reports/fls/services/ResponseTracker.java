package com.ericsson.tools.pm.filecollectionverification.reports.fls.services;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsBaseReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsBaseReportResponse;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.ReportOutputRecord;

import java.util.List;

public class ResponseTracker {
    private String trackerId;
    private boolean requestCompleted;
    private boolean requestServed;
    private FlsBaseReportRequest flsBaseReportRequest;
    private List<? extends ReportOutputRecord> reportOutputRecordList;
    private FlsBaseReportResponse flsBaseReportResponse;

    public String getTrackerId() {
        return trackerId;
    }

    public void setTrackerId(final String trackerId) {
        this.trackerId = trackerId;
    }

    public boolean isRequestCompleted() {
        return requestCompleted;
    }

    public void setRequestCompleted(final boolean requestCompleted) {
        this.requestCompleted = requestCompleted;
    }

    public boolean isRequestServed() {
        return requestServed;
    }

    public void setRequestServed(final boolean requestServed) {
        this.requestServed = requestServed;
    }

    public FlsBaseReportRequest getFlsBaseReportRequest() {
        return flsBaseReportRequest;
    }

    public void setFlsBaseReportRequest(final FlsBaseReportRequest flsBaseReportRequest) {
        this.flsBaseReportRequest = flsBaseReportRequest;
    }

    public List<? extends ReportOutputRecord> getReportOutputRecordList() {
        return reportOutputRecordList;
    }

    public void setReportOutputRecordList(final List<? extends ReportOutputRecord> reportOutputRecordList) {
        this.reportOutputRecordList = reportOutputRecordList;
    }

    public FlsBaseReportResponse getFlsBaseReportResponse() {
        return flsBaseReportResponse;
    }

    public void setFlsBaseReportResponse(final FlsBaseReportResponse flsBaseReportResponse) {
        this.flsBaseReportResponse = flsBaseReportResponse;
    }
}
