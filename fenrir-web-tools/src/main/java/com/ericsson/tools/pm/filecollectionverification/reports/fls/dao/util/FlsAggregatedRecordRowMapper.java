package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsAggregatedRecordsOutputRow;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class FlsAggregatedRecordRowMapper implements RowMapper<FlsAggregatedRecordsOutputRow> {
    @Override
    public FlsAggregatedRecordsOutputRow mapRow(final ResultSet resultSet, final int i) throws SQLException {
        FlsAggregatedRecordsOutputRow flsAggregatedRecordsOutputRow = new FlsAggregatedRecordsOutputRow();
        flsAggregatedRecordsOutputRow.setNodeName(resultSet.getString("node_name"));
        flsAggregatedRecordsOutputRow.setStrippedNodeName(resultSet.getString("stripped_node_name"));
        flsAggregatedRecordsOutputRow.setDataType(resultSet.getString("data_type"));
        flsAggregatedRecordsOutputRow.setNodeType(resultSet.getString("node_type"));
        flsAggregatedRecordsOutputRow.setRopStartTimeInMillis(resultSet.getTimestamp("start_roptime_in_oss").getTime());
        flsAggregatedRecordsOutputRow.setRopEndTimeInMillis(resultSet.getTimestamp("end_roptime_in_oss").getTime());
        flsAggregatedRecordsOutputRow.setNumFiles(resultSet.getInt("num_files"));
        flsAggregatedRecordsOutputRow.setNumFiles(resultSet.getInt("num_files"));

        return flsAggregatedRecordsOutputRow;
    }
}
