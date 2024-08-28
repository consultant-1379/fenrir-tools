package com.ericsson.oss.gerrit.servicegrouplookup;

public class Driver {
    public static void main(String[] args) {
        ServiceGroupLookup serviceGroupLookup = null;
        serviceGroupLookup = new ServiceGroupLookup();
        serviceGroupLookup.findServiceGroupVersion();
    }
}
