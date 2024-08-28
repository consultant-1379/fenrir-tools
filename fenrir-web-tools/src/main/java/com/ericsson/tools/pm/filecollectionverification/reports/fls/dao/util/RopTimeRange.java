package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util;

import java.time.LocalDateTime;

public class RopTimeRange {
    private LocalDateTime ropStartTimeLocalDateTime;
    private LocalDateTime ropEndTimeLocalDateTime;
    private int ropIntervalInMinutes;

    public RopTimeRange(LocalDateTime ropStartTimeLocalDateTime, int ropIntervalInMinutes) {
        this.ropIntervalInMinutes = ropIntervalInMinutes;
        this.ropStartTimeLocalDateTime = ropStartTimeLocalDateTime;
        this.ropEndTimeLocalDateTime = ropStartTimeLocalDateTime.plusMinutes(ropIntervalInMinutes);
    }

    public LocalDateTime getRopStartTimeLocalDateTime() {
        return ropStartTimeLocalDateTime;
    }

    public LocalDateTime getRopEndTimeLocalDateTime() {
        return ropEndTimeLocalDateTime;
    }
}
