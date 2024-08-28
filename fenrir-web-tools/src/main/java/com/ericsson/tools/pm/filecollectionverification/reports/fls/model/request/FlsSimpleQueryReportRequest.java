package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request;

import java.util.List;

public class FlsSimpleQueryReportRequest extends FlsBaseReportRequest {
    private boolean ropTimeSearchCriteriaEnabled;

    private boolean fileCreationTimeSearchCriteriaEnabled;
    private long fileCreationStartTimeInMillis;
    private long fileCreationEndTimeInMillis;

    private boolean nodeNameSearchCriteriaEnabled;
    private String nodeNameSearchCriteriaOperator;
    private String nodeName;

    private boolean nodeTypesSearchCriteriaEnabled;
    private List<String> nodeTypes;

    private boolean dataTypesSearchCriteriaEnabled;

    public boolean isRopTimeSearchCriteriaEnabled() {
        return ropTimeSearchCriteriaEnabled;
    }

    public void setRopTimeSearchCriteriaEnabled(final boolean ropTimeSearchCriteriaEnabled) {
        this.ropTimeSearchCriteriaEnabled = ropTimeSearchCriteriaEnabled;
    }

    public boolean isFileCreationTimeSearchCriteriaEnabled() {
        return fileCreationTimeSearchCriteriaEnabled;
    }

    public void setFileCreationTimeSearchCriteriaEnabled(final boolean fileCreationTimeSearchCriteriaEnabled) {
        this.fileCreationTimeSearchCriteriaEnabled = fileCreationTimeSearchCriteriaEnabled;
    }

    public long getFileCreationStartTimeInMillis() {
        return fileCreationStartTimeInMillis;
    }

    public void setFileCreationStartTimeInMillis(final long fileCreationStartTimeInMillis) {
        this.fileCreationStartTimeInMillis = fileCreationStartTimeInMillis;
    }

    public long getFileCreationEndTimeInMillis() {
        return fileCreationEndTimeInMillis;
    }

    public void setFileCreationEndTimeInMillis(final long fileCreationEndTimeInMillis) {
        this.fileCreationEndTimeInMillis = fileCreationEndTimeInMillis;
    }

    public boolean isNodeNameSearchCriteriaEnabled() {
        return nodeNameSearchCriteriaEnabled;
    }

    public void setNodeNameSearchCriteriaEnabled(final boolean nodeNameSearchCriteriaEnabled) {
        this.nodeNameSearchCriteriaEnabled = nodeNameSearchCriteriaEnabled;
    }

    public String getNodeNameSearchCriteriaOperator() {
        return nodeNameSearchCriteriaOperator;
    }

    public void setNodeNameSearchCriteriaOperator(final String nodeNameSearchCriteriaOperator) {
        this.nodeNameSearchCriteriaOperator = nodeNameSearchCriteriaOperator;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(final String nodeName) {
        this.nodeName = nodeName;
    }

    public boolean isNodeTypesSearchCriteriaEnabled() {
        return nodeTypesSearchCriteriaEnabled;
    }

    public void setNodeTypesSearchCriteriaEnabled(final boolean nodeTypesSearchCriteriaEnabled) {
        this.nodeTypesSearchCriteriaEnabled = nodeTypesSearchCriteriaEnabled;
    }

    public List<String> getNodeTypes() {
        return nodeTypes;
    }

    public void setNodeTypes(final List<String> nodeTypes) {
        this.nodeTypes = nodeTypes;
    }

    public boolean isDataTypesSearchCriteriaEnabled() {
        return dataTypesSearchCriteriaEnabled;
    }

    public void setDataTypesSearchCriteriaEnabled(final boolean dataTypesSearchCriteriaEnabled) {
        this.dataTypesSearchCriteriaEnabled = dataTypesSearchCriteriaEnabled;
    }
}
