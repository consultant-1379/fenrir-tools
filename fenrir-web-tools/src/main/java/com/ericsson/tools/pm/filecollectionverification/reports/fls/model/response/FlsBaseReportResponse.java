package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response;

import java.util.List;

public class FlsBaseReportResponse {
    private int maxRecordsToRetrieve;
    private int maxRecordsRetrieved;
    private String maxRecordsRetrievedMessage;
    private List<? extends ReportOutputRecord> records;

    public FlsBaseReportResponse() {

    }

    public int getMaxRecordsToRetrieve() {
        return maxRecordsToRetrieve;
    }

    public void setMaxRecordsToRetrieve(final int maxRecordsToRetrieve) {
        this.maxRecordsToRetrieve = maxRecordsToRetrieve;
    }

    public int getMaxRecordsRetrieved() {
        return maxRecordsRetrieved;
    }

    public void setMaxRecordsRetrieved(final int maxRecordsRetrieved) {
        this.maxRecordsRetrieved = maxRecordsRetrieved;
    }

    public String getMaxRecordsRetrievedMessage() {
        return maxRecordsRetrievedMessage;
    }

    public void setMaxRecordsRetrievedMessage(final String maxRecordsRetrievedMessage) {
        this.maxRecordsRetrievedMessage = maxRecordsRetrievedMessage;
    }

    public List<?> getRecords() {
        return records;
    }

    public void setRecords(final List<? extends ReportOutputRecord> records) {
        this.records = records;
    }
}
