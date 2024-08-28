package com.ericsson.tools.pm.filecollectionverification.reports.fls.services;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.RopTimeRange;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.SelectedLiveNode;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsMismatchingRecordsReportRequest;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public abstract class FlsMismatchFinderBaseService {
    protected List<RopTimeRange> calculateRopsRange(final long ropStartTimeInMillis, final long ropEndTimeInMillis,
                                                    final int ropIntervalInMinutes) {
        List<RopTimeRange> ropTimeRanges = new ArrayList<>();

        LocalDateTime ropStartTimeLocalDateTime = LocalDateTime.ofInstant(new Date(ropStartTimeInMillis).toInstant(), ZoneId.systemDefault());
        LocalDateTime ropEndTimeLocalDateTime = LocalDateTime.ofInstant(new Date(ropEndTimeInMillis).toInstant(), ZoneId.systemDefault());
        LocalDateTime pivotLocalDateTime = null;

        if (ropIntervalInMinutes == 15) {
            pivotLocalDateTime = ropStartTimeLocalDateTime.truncatedTo(ChronoUnit.HOURS)
                    .plusMinutes(ropIntervalInMinutes * (ropStartTimeLocalDateTime.getMinute() / ropIntervalInMinutes));
        } else if (ropIntervalInMinutes == 1) {
            pivotLocalDateTime = ropStartTimeLocalDateTime.truncatedTo(ChronoUnit.MINUTES)
                    .plusMinutes(ropIntervalInMinutes * (ropStartTimeLocalDateTime.getMinute() / ropIntervalInMinutes));
        }

        // Add first ROP
        RopTimeRange pivotRopTimeRange = new RopTimeRange(pivotLocalDateTime, ropIntervalInMinutes);
        ropTimeRanges.add(pivotRopTimeRange);
        pivotLocalDateTime = pivotLocalDateTime.plusMinutes(ropIntervalInMinutes);

        // Continue iterating to add the rest until we reach the rop end time
        while (pivotLocalDateTime.isBefore(ropEndTimeLocalDateTime)) {
            ropTimeRanges.add(new RopTimeRange(pivotLocalDateTime, ropIntervalInMinutes));
            pivotLocalDateTime = pivotLocalDateTime.plusMinutes(ropIntervalInMinutes);
        }

        return ropTimeRanges;
    }

    protected List<String> extractNodeNames(FlsMismatchingRecordsReportRequest flsMismatchingRecordsReportRequest) {
        List<String> nodeNames = new ArrayList();

        for(SelectedLiveNode selectedLiveNode: flsMismatchingRecordsReportRequest.getSelectedLiveNodes()) {
            nodeNames.add(selectedLiveNode.getNode().getName());
        }

        return nodeNames;
    }
}
