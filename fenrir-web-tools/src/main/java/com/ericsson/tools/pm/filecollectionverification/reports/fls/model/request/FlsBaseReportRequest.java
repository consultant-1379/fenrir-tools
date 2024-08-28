package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.SelectedLiveNode;

import java.util.List;

public class FlsBaseReportRequest {
    private long ropStartTimeInMillis;
    private long ropEndTimeInMillis;
    private List<SelectedLiveNode> selectedLiveNodes;
    private List<String> dataTypes;
    private int maxRecordsToRetrieve;

    public long getRopStartTimeInMillis() {
        return ropStartTimeInMillis;
    }

    public void setRopStartTimeInMillis(final long ropStartTimeInMillis) {
        this.ropStartTimeInMillis = ropStartTimeInMillis;
    }

    public long getRopEndTimeInMillis() {
        return ropEndTimeInMillis;
    }

    public void setRopEndTimeInMillis(final long ropEndTimeInMillis) {
        this.ropEndTimeInMillis = ropEndTimeInMillis;
    }

    public List<SelectedLiveNode> getSelectedLiveNodes() {
        return selectedLiveNodes;
    }

    public void setSelectedLiveNodes(final List<SelectedLiveNode> selectedLiveNodes) {
        this.selectedLiveNodes = selectedLiveNodes;
    }

    public List<String> getDataTypes() {
        return dataTypes;
    }

    public void setDataTypes(final List<String> dataTypes) {
        this.dataTypes = dataTypes;
    }

    public int getMaxRecordsToRetrieve() {
        return maxRecordsToRetrieve;
    }

    public void setMaxRecordsToRetrieve(final int maxRecordsToRetrieve) {
        this.maxRecordsToRetrieve = maxRecordsToRetrieve;
    }
}
