package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.impl;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.DateConverter;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.FlsMismatchFinderDao;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.FlsAggregatedRecordRowMapper;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.RopTimeRange;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.DataTypeAndExpectedRecords;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsAggregatedRecordsOutputRow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class FlsMismatchFinderDaoImpl implements FlsMismatchFinderDao {

    private Logger logger = LoggerFactory.getLogger(FlsMismatchFinderDaoImpl.class);

    @Autowired
    private DateConverter dateConverter;

    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public FlsMismatchFinderDaoImpl(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
    }

    @Override
    public List<FlsAggregatedRecordsOutputRow> findAll(final List<String> nodeNames,
                                                          final List<DataTypeAndExpectedRecords> dataTypeAndExpectedRecords,
                                                          final long ropStartTimeInMillis,
                                                          final long ropEndTimeInMillis,
                                                          final int ropIntervalInMinutes,
                                                          final boolean showOnlyMismatchingRecords,
                                                          final int maxRecordsToRetrieve,
                                                          final List<RopTimeRange> ropTimeRanges) {

        String aggregated = buildAggregatedCountsOfExistingRecords(nodeNames, dataTypeAndExpectedRecords,
                ropStartTimeInMillis, ropEndTimeInMillis);

        return namedParameterJdbcTemplate.query(aggregated, new FlsAggregatedRecordRowMapper());
    }

    private String buildAggregatedCountsOfExistingRecords(final List<String> nodeNames,
                                                          final List<DataTypeAndExpectedRecords> dataTypeAndExpectedRecords,
                                                          final long ropStartTimeInMillis,
                                                          final long ropEndTimeInMillis) {
        StringBuffer sb = new StringBuffer();
        sb.append("select \n" +
                        "pmrop_count_per_node_data_type_rop.node_name,\n" +
                        "reverse(substr(reverse(pmrop_count_per_node_data_type_rop.node_name), 0, strpos(reverse(pmrop_count_per_node_data_type_rop.node_name), '='))) stripped_node_name," +
                        "pmrop_count_per_node_data_type_rop.data_type,\n" +
                        "pmrop_count_per_node_data_type_rop.node_type,\n" +
                        "date_trunc('minute', pmrop_count_per_node_data_type_rop.start_roptime_in_oss) start_roptime_in_oss,\n" +
                        "date_trunc('minute', pmrop_count_per_node_data_type_rop.end_roptime_in_oss) end_roptime_in_oss,\n" +
                        "count(*) num_files\n" +
                        "from pm_rop_info pmrop_count_per_node_data_type_rop\n" +
                        "where \n" +
                        "date_trunc('minute', pmrop_count_per_node_data_type_rop.start_roptime_in_oss) >= date_trunc('minute', TIMESTAMP '" + dateConverter.convertDateToFormattedStringForPostgres(ropStartTimeInMillis) + "')\n" +
                        "and date_trunc('minute', pmrop_count_per_node_data_type_rop.end_roptime_in_oss) <= date_trunc('minute', TIMESTAMP '" + dateConverter.convertDateToFormattedStringForPostgres(ropEndTimeInMillis) + "')\n" +
                        "and (\n");

        String delimiter = "";
        for (String nodeName : nodeNames) {
            sb.append(delimiter);
            sb.append("pmrop_count_per_node_data_type_rop.node_name like '%" + nodeName + "%'");
            delimiter = " OR\n";
        }

        sb.append(") and ( pmrop_count_per_node_data_type_rop.data_type in (\n");
        delimiter = "";
        for (DataTypeAndExpectedRecords dataTypeAndExpectedRecord: dataTypeAndExpectedRecords) {
            sb.append(delimiter);
            sb.append("'"+ dataTypeAndExpectedRecord.getDataType() + "' \n");
            delimiter = ",";
        }
        sb.append(")\n");

        sb.append(")\n" +
                "group by pmrop_count_per_node_data_type_rop.node_name,\n" +
                "pmrop_count_per_node_data_type_rop.data_type,\n" +
                "pmrop_count_per_node_data_type_rop.node_type,\n" +
                "pmrop_count_per_node_data_type_rop.start_roptime_in_oss,\n" +
                "pmrop_count_per_node_data_type_rop.end_roptime_in_oss");
        return sb.toString();
    }
}
