package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response;

public class FlsRecord implements ReportOutputRecord {
    private long id;
    private String nodeName;
    private String nodeType;
    private String dataType;
    private String fileType;
    private int fileSize;
    private String fileLocation;
    private long fileCreationTimeInMillis;
    private String fileCreationTimeFormatted;
    private long ropStartTimeInMillis;
    private String ropStartTimeFormatted;
    private long ropEndTimeInMillis;
    private String ropEndTimeFormatted;

    public long getId() {
        return id;
    }

    public void setId(final long id) {
        this.id = id;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(final String nodeName) {
        this.nodeName = nodeName;
    }

    public String getNodeType() {
        return nodeType;
    }

    public void setNodeType(final String nodeType) {
        this.nodeType = nodeType;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(final String dataType) {
        this.dataType = dataType;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(final String fileType) {
        this.fileType = fileType;
    }

    public int getFileSize() {
        return fileSize;
    }

    public void setFileSize(final int fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileLocation() {
        return fileLocation;
    }

    public void setFileLocation(final String fileLocation) {
        this.fileLocation = fileLocation;
    }

    public long getFileCreationTimeInMillis() {
        return fileCreationTimeInMillis;
    }

    public void setFileCreationTimeInMillis(final long fileCreationTimeInMillis) {
        this.fileCreationTimeInMillis = fileCreationTimeInMillis;
    }

    public String getFileCreationTimeFormatted() {
        return fileCreationTimeFormatted;
    }

    public void setFileCreationTimeFormatted(final String fileCreationTimeFormatted) {
        this.fileCreationTimeFormatted = fileCreationTimeFormatted;
    }

    public long getRopStartTimeInMillis() {
        return ropStartTimeInMillis;
    }

    public void setRopStartTimeInMillis(final long ropStartTimeInMillis) {
        this.ropStartTimeInMillis = ropStartTimeInMillis;
    }

    public String getRopStartTimeFormatted() {
        return ropStartTimeFormatted;
    }

    public void setRopStartTimeFormatted(final String ropStartTimeFormatted) {
        this.ropStartTimeFormatted = ropStartTimeFormatted;
    }

    public long getRopEndTimeInMillis() {
        return ropEndTimeInMillis;
    }

    public void setRopEndTimeInMillis(final long ropEndTimeInMillis) {
        this.ropEndTimeInMillis = ropEndTimeInMillis;
    }

    public String getRopEndTimeFormatted() {
        return ropEndTimeFormatted;
    }

    public void setRopEndTimeFormatted(final String ropEndTimeFormatted) {
        this.ropEndTimeFormatted = ropEndTimeFormatted;
    }
}
