package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsDupRecordsReportOutputRow;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class FlsDupRecordRowMapper implements RowMapper<FlsDupRecordsReportOutputRow>{
    @Override
    public FlsDupRecordsReportOutputRow mapRow(final ResultSet resultSet, final int i) throws SQLException {
        FlsDupRecordsReportOutputRow flsDupRecord = new FlsDupRecordsReportOutputRow();
        flsDupRecord.setNodeName(resultSet.getString("stripped_node_name"));
        flsDupRecord.setRopStartTimeInMillis(resultSet.getDate("start_roptime_in_oss").getTime());
        flsDupRecord.setRopStartTimeFormatted(resultSet.getString("start_roptime_in_oss_as_string"));
        flsDupRecord.setRecordCount(resultSet.getInt("record_count"));
        return flsDupRecord;
    }
}
