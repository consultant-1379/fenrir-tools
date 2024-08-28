package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsRecord;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class FlsSimpleQueryRowMapper implements RowMapper<FlsRecord> {

    @Override
    public FlsRecord mapRow(final ResultSet resultSet, final int i) throws SQLException {
        FlsRecord flsRecord = new FlsRecord();
        flsRecord.setId(resultSet.getLong("id"));
        flsRecord.setNodeName(resultSet.getString("node_name"));
        flsRecord.setNodeType(resultSet.getString("node_type"));
        flsRecord.setDataType(resultSet.getString("data_type"));
        flsRecord.setFileType(resultSet.getString("file_type"));
        flsRecord.setFileSize(resultSet.getInt("file_size"));
        flsRecord.setFileLocation(resultSet.getString("file_location"));
        flsRecord.setFileCreationTimeInMillis(resultSet.getDate("file_creationtime_in_oss").getTime());
        flsRecord.setFileCreationTimeFormatted(resultSet.getString("file_creationtime_in_oss_as_string"));
        flsRecord.setRopStartTimeInMillis(resultSet.getDate("start_roptime_in_oss").getTime());
        flsRecord.setRopStartTimeFormatted(resultSet.getString("start_roptime_in_oss_as_string"));
        flsRecord.setRopEndTimeInMillis(resultSet.getDate("end_roptime_in_oss").getTime());
        flsRecord.setRopEndTimeFormatted(resultSet.getString("end_roptime_in_oss_as_string"));
        return flsRecord;
    }
}
