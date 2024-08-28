package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response;

public class FlsDupRecordsReportOutputRow extends FlsRecord {

    private String network;
    private String simulation;
    private String nodeName;
    private long ropStartTimeInMillis;
    private String ropStartTimeFormatted;
    private int recordCount;

    public String getNetwork() {
        return network;
    }

    public void setNetwork(final String network) {
        this.network = network;
    }

    public String getSimulation() {
        return simulation;
    }

    public void setSimulation(final String simulation) {
        this.simulation = simulation;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(final String nodeName) {
        this.nodeName = nodeName;
    }

    public long getRopStartTimeInMillis() {
        return ropStartTimeInMillis;
    }

    public void setRopStartTimeInMillis(final long ropStartTimeInMillis) {
        this.ropStartTimeInMillis = ropStartTimeInMillis;
    }

    public void setRopStartTimeFormatted(final String ropStartTimeFormatted) {
        this.ropStartTimeFormatted = ropStartTimeFormatted;
    }

    public String getRopStartTimeFormatted() {
        return this.ropStartTimeFormatted;
    }

    public int getRecordCount() {
        return recordCount;
    }

    public void setRecordCount(final int recordCount) {
        this.recordCount = recordCount;
    }
}
