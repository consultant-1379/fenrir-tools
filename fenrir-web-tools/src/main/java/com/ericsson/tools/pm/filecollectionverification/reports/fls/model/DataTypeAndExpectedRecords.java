package com.ericsson.tools.pm.filecollectionverification.reports.fls.model;

public class DataTypeAndExpectedRecords {

    private String dataType;
    private int expectedRecords;

    public String getDataType() {
        return dataType;
    }

    public void setDataType(final String dataType) {
        this.dataType = dataType;
    }

    public int getExpectedRecords() {
        return expectedRecords;
    }

    public void setExpectedRecords(final int expectedRecords) {
        this.expectedRecords = expectedRecords;
    }
}
