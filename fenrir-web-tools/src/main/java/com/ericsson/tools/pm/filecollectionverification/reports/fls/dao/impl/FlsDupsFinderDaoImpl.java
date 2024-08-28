package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.impl;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.FlsDupsFinderDao;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.DateConverter;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.FlsDupRecordRowMapper;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsDupRecordsReportOutputRow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public class FlsDupsFinderDaoImpl implements FlsDupsFinderDao {

    @Autowired
    private DateConverter dateConverter;

    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public FlsDupsFinderDaoImpl(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
    }

    @Override
    public List<FlsDupRecordsReportOutputRow> findAll(final List<String> nodeNames, final List<String> dataTypes,
                                                      final long ropStartTimeInMillis, final long ropEndTimeInMillis,
                                                      final int maxFilesExpected,
                                                      final int maxRecordsToRetrieve) {
        String query = "select\n" +
                "stripped_node_name,\n" +
                "start_roptime_in_oss,\n" +
                "to_char(start_roptime_in_oss, 'YYYY-MM-DD HH24:MI') start_roptime_in_oss_as_string, \n" +
                "count(*) record_count \n" +
                "from (\n" +
                "select \n" +
                "substring(node_name from (position('LTE' in node_name)) for 18 ) stripped_node_name, \n" +
                "node_type, data_type, start_roptime_in_oss, end_roptime_in_oss,\n" +
                "file_creationtime_in_oss\n" +
                "from pm_rop_info\n" +
                "where \n" +
                "(\n" + buildNodeNameLikeClause(nodeNames) +
                ")\n" +
                "and data_type in (" + buildDataTypeInClause(dataTypes) + ")\n" +
                "and start_roptime_in_oss >= TIMESTAMP '" + dateConverter.convertDateToFormattedStringForPostgres(ropStartTimeInMillis) + "'\n" +
                "and end_roptime_in_oss <= TIMESTAMP '" + dateConverter.convertDateToFormattedStringForPostgres(ropEndTimeInMillis) + "'\n" +
                "order by node_name asc, start_roptime_in_oss asc\n" +
                ") as sq1\n" +
                "group by sq1.stripped_node_name, sq1.start_roptime_in_oss\n" +
                "having count(*) > " + maxFilesExpected + "\n" +
                "order by sq1.stripped_node_name asc, sq1.start_roptime_in_oss asc \n" +
                "LIMIT " + maxRecordsToRetrieve;

        return namedParameterJdbcTemplate.query(query, new FlsDupRecordRowMapper());
    }

    private String buildDataTypeInClause(final List<String> dataTypes) {
        StringBuffer sb = new StringBuffer();
        String delimiter = "";
        for(String dataType : dataTypes) {
            sb.append(delimiter);
            sb.append("'" + dataType + "'");
            delimiter = ",";
        }
        return sb.toString();
    }

    private String buildNodeNameLikeClause(List<String> nodeNames) {
        StringBuffer sb = new StringBuffer();
        String delimiter = "";
        for(String nodeName : nodeNames) {
            sb.append(delimiter);
            sb.append(" node_name like '%" + nodeName + "%'");
            delimiter = " OR \n";
        }
        return sb.toString();
    }
}
