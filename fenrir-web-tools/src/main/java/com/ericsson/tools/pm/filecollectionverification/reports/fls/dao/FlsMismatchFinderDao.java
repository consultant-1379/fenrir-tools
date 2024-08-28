package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.RopTimeRange;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.DataTypeAndExpectedRecords;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsAggregatedRecordsOutputRow;

import java.util.List;

public interface FlsMismatchFinderDao {

    List<FlsAggregatedRecordsOutputRow> findAll(final List<String> nodeNames, final List<DataTypeAndExpectedRecords> dataTypeAndExpectedRecords,
                                                final long ropStartTimeInMillis, final long ropEndTimeInMillis,
                                                final int ropIntervalInMinutes,
                                                final boolean showOnlyMismatchingRecords,
                                                final int maxRecordsToRetrieve,
                                                final List<RopTimeRange> ropTimeRanges);
}
