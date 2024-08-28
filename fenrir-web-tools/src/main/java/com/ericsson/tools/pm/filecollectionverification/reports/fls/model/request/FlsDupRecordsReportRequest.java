package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request;

public class FlsDupRecordsReportRequest extends FlsBaseReportRequest {

    private int maxFilesExpected;

    public int getMaxFilesExpected() {
        return maxFilesExpected;
    }

    public void setMaxFilesExpected(final int maxFilesExpected) {
        this.maxFilesExpected = maxFilesExpected;
    }
}
