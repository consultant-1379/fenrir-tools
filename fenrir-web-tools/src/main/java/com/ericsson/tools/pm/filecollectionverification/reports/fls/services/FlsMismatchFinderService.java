package com.ericsson.tools.pm.filecollectionverification.reports.fls.services;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.FlsMismatchFinderDao;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.DateConverter;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.RopTimeRange;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.DataTypeAndExpectedRecords;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsMismatchingRecordsReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsAggregatedRecordsOutputRow;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsMismatchFinderReportOutputRow;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class FlsMismatchFinderService extends FlsMismatchFinderBaseService {

    @Resource
    private FlsMismatchFinderDao flsMismatchFinderDao;

    @Resource
    private DateConverter dateConverter;

    public List<FlsMismatchFinderReportOutputRow> findAll(final FlsMismatchingRecordsReportRequest flsMismatchingRecordsReportRequest) {
        List<RopTimeRange> ropTimeRanges = calculateRopsRange(
                flsMismatchingRecordsReportRequest.getRopStartTimeInMillis(),
                flsMismatchingRecordsReportRequest.getRopEndTimeInMillis(),
                flsMismatchingRecordsReportRequest.getRopIntervalInMinutes()
        );

        List<String> flsMismatchFinderReportOutputRowSortedKeys = new ArrayList();
        Map<String, FlsMismatchFinderReportOutputRow> flsMismatchFinderReportOutputRowMap = new HashMap();
        extractNodeNames(flsMismatchingRecordsReportRequest).forEach(nodeName -> {
            flsMismatchingRecordsReportRequest.getDataTypesAndExpectedRecords().forEach( dataTypeAndExpectedRecord -> {
                ropTimeRanges.forEach(ropTimeRange -> {
                    processExpectedFlsMismatchRow(flsMismatchFinderReportOutputRowSortedKeys, flsMismatchFinderReportOutputRowMap, nodeName, dataTypeAndExpectedRecord, ropTimeRange);
                });
            });
        });

        Collections.sort(flsMismatchFinderReportOutputRowSortedKeys);

        List<FlsAggregatedRecordsOutputRow> flsAggregatedRecordsOutputRowList =
                flsMismatchFinderDao.findAll(extractNodeNames(flsMismatchingRecordsReportRequest),
                flsMismatchingRecordsReportRequest.getDataTypesAndExpectedRecords(),
                flsMismatchingRecordsReportRequest.getRopStartTimeInMillis(),
                flsMismatchingRecordsReportRequest.getRopEndTimeInMillis(),
                flsMismatchingRecordsReportRequest.getRopIntervalInMinutes(),
                flsMismatchingRecordsReportRequest.isShowOnlyMismatchingRecords(),
                flsMismatchingRecordsReportRequest.getMaxRecordsToRetrieve(),
                ropTimeRanges);

        flsAggregatedRecordsOutputRowList.forEach(elem -> {
            processResultSetAndSetActualNumFilesFromDatabaseQuery(flsMismatchFinderReportOutputRowMap, elem);
        });

        return buildReportOutputWithEnrichedDataFromDatabase(flsMismatchingRecordsReportRequest, flsMismatchFinderReportOutputRowSortedKeys,
                flsMismatchFinderReportOutputRowMap);

    }

    private List<FlsMismatchFinderReportOutputRow> buildReportOutputWithEnrichedDataFromDatabase(
            final FlsMismatchingRecordsReportRequest flsMismatchingRecordsReportRequest, final List<String> flsMismatchFinderReportOutputRowSortedKeys, final Map<String, FlsMismatchFinderReportOutputRow> flsMismatchFinderReportOutputRowMap) {
        return flsMismatchFinderReportOutputRowSortedKeys
                .stream()
                .map(rowKey -> flsMismatchFinderReportOutputRowMap.get(rowKey))
                .filter(record ->  {
                    if (flsMismatchingRecordsReportRequest.isShowOnlyMismatchingRecords()) {
                        return record.getExpectedNumFiles() != record.getNumFiles();
                    } else {
                        return true;
                    }
                })
                .collect(Collectors.toList());
    }

    private void processResultSetAndSetActualNumFilesFromDatabaseQuery(final Map<String, FlsMismatchFinderReportOutputRow> flsMismatchFinderReportOutputRowMap, final FlsAggregatedRecordsOutputRow elem) {
        String rowKey = elem.getStrippedNodeName() + "_" + elem.getDataType() +
                "_" + elem.getRopStartTimeInMillis() +
                "_" + elem.getRopEndTimeInMillis();
        flsMismatchFinderReportOutputRowMap.get(rowKey).setNumFiles(elem.getNumFiles());
    }

    private void processExpectedFlsMismatchRow(final List<String> flsMismatchFinderReportOutputRowSortedKeys, final Map<String, FlsMismatchFinderReportOutputRow> flsMismatchFinderReportOutputRowMap, final String nodeName, final DataTypeAndExpectedRecords dataTypeAndExpectedRecord, final RopTimeRange ropTimeRange) {
        long expectedRopStartTimeInMillis = dateConverter.convertLocalDateTimeToMillis(ropTimeRange.getRopStartTimeLocalDateTime());
        String expectedRopStartTimeFormatted = dateConverter.convertDateToFormattedStringForPostgres(expectedRopStartTimeInMillis);
        long expectedRopEndTimeInMillis = dateConverter.convertLocalDateTimeToMillis(ropTimeRange.getRopEndTimeLocalDateTime());
        String expectedRopEndTimeFormatted = dateConverter.convertDateToFormattedStringForPostgres(expectedRopEndTimeInMillis);

        String rowKey = nodeName + "_" + dataTypeAndExpectedRecord.getDataType() +
                "_" + expectedRopStartTimeInMillis +
                "_" + expectedRopEndTimeInMillis;
        FlsMismatchFinderReportOutputRow flsMismatchFinderReportOutputRow
                = new FlsMismatchFinderReportOutputRow();
        flsMismatchFinderReportOutputRow.setExpectedDataType(dataTypeAndExpectedRecord.getDataType());
        flsMismatchFinderReportOutputRow.setExpectedNodeName(nodeName);
        flsMismatchFinderReportOutputRow.setExpectedNumFiles(dataTypeAndExpectedRecord.getExpectedRecords());
        flsMismatchFinderReportOutputRow.setExpectedRopEndTimeFormatted(expectedRopEndTimeFormatted);
        flsMismatchFinderReportOutputRow.setExpectedRopEndTimeInMillis(expectedRopEndTimeInMillis);
        flsMismatchFinderReportOutputRow.setExpectedRopStartTimeFormatted(expectedRopStartTimeFormatted);
        flsMismatchFinderReportOutputRow.setExpectedRopStartTimeInMillis(expectedRopStartTimeInMillis);
        flsMismatchFinderReportOutputRowMap.put(rowKey, flsMismatchFinderReportOutputRow);
        flsMismatchFinderReportOutputRowSortedKeys.add(rowKey);
    }
}
