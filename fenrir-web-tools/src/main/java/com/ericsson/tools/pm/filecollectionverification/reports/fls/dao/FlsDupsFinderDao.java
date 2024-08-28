package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsDupRecordsReportOutputRow;

import java.util.List;

public interface FlsDupsFinderDao {
    List<FlsDupRecordsReportOutputRow> findAll(final List<String> nodeNames, final List<String> dataTypes, final long ropStartTimeInMillis,
                                               final long ropEndTimeInMillis, final int maxFilesExpected,
                                               final int maxRecordsToRetrieve);
}
