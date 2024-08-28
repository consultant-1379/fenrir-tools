package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response;


public class FlsMismatchFinderReportOutputRow extends FlsRecord {

    private String expectedNodeName;
    private String expectedDataType;
    private long expectedRopStartTimeInMillis;
    private long expectedRopEndTimeInMillis;
    private String expectedRopStartTimeFormatted;
    private String expectedRopEndTimeFormatted;
    private Integer expectedNumFiles;
    private Integer numFiles;

    public String getExpectedNodeName() {
        return expectedNodeName;
    }

    public void setExpectedNodeName(final String expectedNodeName) {
        this.expectedNodeName = expectedNodeName;
    }

    public String getExpectedDataType() {
        return expectedDataType;
    }

    public void setExpectedDataType(final String expectedDataType) {
        this.expectedDataType = expectedDataType;
    }

    public Integer getExpectedNumFiles() {
        return expectedNumFiles;
    }

    public void setExpectedNumFiles(final Integer expectedNumFiles) {
        this.expectedNumFiles = expectedNumFiles;
    }

    public long getExpectedRopStartTimeInMillis() {
        return expectedRopStartTimeInMillis;
    }

    public void setExpectedRopStartTimeInMillis(final long expectedRopStartTimeInMillis) {
        this.expectedRopStartTimeInMillis = expectedRopStartTimeInMillis;
    }

    public String getExpectedRopStartTimeFormatted() {
        return expectedRopStartTimeFormatted;
    }

    public void setExpectedRopStartTimeFormatted(final String expectedRopStartTimeFormatted) {
        this.expectedRopStartTimeFormatted = expectedRopStartTimeFormatted;
    }

    public long getExpectedRopEndTimeInMillis() {
        return expectedRopEndTimeInMillis;
    }

    public void setExpectedRopEndTimeInMillis(final long expectedRopEndTimeInMillis) {
        this.expectedRopEndTimeInMillis = expectedRopEndTimeInMillis;
    }

    public String getExpectedRopEndTimeFormatted() {
        return expectedRopEndTimeFormatted;
    }

    public void setExpectedRopEndTimeFormatted(final String expectedRopEndTimeFormatted) {
        this.expectedRopEndTimeFormatted = expectedRopEndTimeFormatted;
    }

    public Integer getNumFiles() {
        return numFiles;
    }

    public void setNumFiles(final Integer numFiles) {
        this.numFiles = numFiles;
    }
}
