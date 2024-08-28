package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.DataTypeAndExpectedRecords;

import java.util.List;

public class FlsMismatchingRecordsReportRequest extends FlsBaseReportRequest {

    private List<DataTypeAndExpectedRecords> dataTypesAndExpectedRecords;
    private boolean showOnlyMismatchingRecords;
    private int ropIntervalInMinutes;

    public List<DataTypeAndExpectedRecords> getDataTypesAndExpectedRecords() {
        return dataTypesAndExpectedRecords;
    }

    public void setDataTypesAndExpectedRecords(final List<DataTypeAndExpectedRecords> dataTypesAndExpectedRecords) {
        this.dataTypesAndExpectedRecords = dataTypesAndExpectedRecords;
    }

    public boolean isShowOnlyMismatchingRecords() {
        return showOnlyMismatchingRecords;
    }

    public void setShowOnlyMismatchingRecords(final boolean showOnlyMismatchingRecords) {
        this.showOnlyMismatchingRecords = showOnlyMismatchingRecords;
    }

    public int getRopIntervalInMinutes() {
        return ropIntervalInMinutes;
    }

    public void setRopIntervalInMinutes(final int ropIntervalInMinutes) {
        this.ropIntervalInMinutes = ropIntervalInMinutes;
    }
}
