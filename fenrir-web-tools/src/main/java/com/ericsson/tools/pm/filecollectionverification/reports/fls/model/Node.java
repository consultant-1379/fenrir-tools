package com.ericsson.tools.pm.filecollectionverification.reports.fls.model;

public class Node extends BaseNode {
    private String ip;
    private String neType;

    public String getIp() {
        return ip;
    }

    public void setIp(final String ip) {
        this.ip = ip;
    }

    public String getNeType() {
        return neType;
    }

    public void setNeType(final String neType) {
        this.neType = neType;
    }
}
