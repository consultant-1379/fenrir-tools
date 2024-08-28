package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsMismatchFinderReportOutputRow;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class FlsMismatchFinderRowMapper implements RowMapper<FlsMismatchFinderReportOutputRow> {
    @Override
    public FlsMismatchFinderReportOutputRow mapRow(final ResultSet resultSet, final int i) throws SQLException {
        FlsMismatchFinderReportOutputRow flsMismatchFinderReportOutputRow = new FlsMismatchFinderReportOutputRow();
        flsMismatchFinderReportOutputRow.setExpectedNodeName(resultSet.getString("expected_node_name"));
        flsMismatchFinderReportOutputRow.setExpectedDataType(resultSet.getString("expected_data_type"));
        flsMismatchFinderReportOutputRow.setExpectedNumFiles(resultSet.getInt("expected_num_files"));
        flsMismatchFinderReportOutputRow.setExpectedRopStartTimeInMillis(resultSet.getDate("expected_start_roptime_in_oss").getTime());
        flsMismatchFinderReportOutputRow.setExpectedRopStartTimeFormatted(resultSet.getString("expected_start_roptime_in_oss_as_string"));
        flsMismatchFinderReportOutputRow.setExpectedRopEndTimeInMillis(resultSet.getDate("expected_end_roptime_in_oss").getTime());
        flsMismatchFinderReportOutputRow.setExpectedRopEndTimeFormatted(resultSet.getString("expected_end_roptime_in_oss_as_string"));
        flsMismatchFinderReportOutputRow.setNumFiles(resultSet.getObject("num_files") != null ? resultSet.getInt("num_files") : null);

        return flsMismatchFinderReportOutputRow;
    }
}
