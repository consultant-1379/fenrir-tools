package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response;


public class FlsAggregatedRecordsOutputRow extends FlsRecord {

    private String strippedNodeName;
    private Integer numFiles;


    public String getStrippedNodeName() {
        return strippedNodeName;
    }

    public void setStrippedNodeName(final String strippedNodeName) {
        this.strippedNodeName = strippedNodeName;
    }

    public Integer getNumFiles() {
        return numFiles;
    }

    public void setNumFiles(final Integer numFiles) {
        this.numFiles = numFiles;
    }
}
