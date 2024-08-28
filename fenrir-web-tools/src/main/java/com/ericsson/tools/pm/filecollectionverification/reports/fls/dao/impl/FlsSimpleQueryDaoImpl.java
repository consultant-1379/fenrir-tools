package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.impl;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.FlsSimpleQueryDao;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.DateConverter;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.FlsSimpleQueryRowMapper;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsSimpleQueryReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class FlsSimpleQueryDaoImpl implements FlsSimpleQueryDao {

    @Autowired
    private DateConverter dateConverter;

    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public FlsSimpleQueryDaoImpl(final NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
    }

    @Override
    public List<FlsRecord> findAll(final FlsSimpleQueryReportRequest flsSimpleQueryReportRequest) {
        String query = buildQuery(flsSimpleQueryReportRequest);
        return this.namedParameterJdbcTemplate.query(query, new FlsSimpleQueryRowMapper());
    }

    private String buildQuery(final FlsSimpleQueryReportRequest flsSimpleQueryReportRequest) {
        StringBuffer sb = new StringBuffer();
        sb.append("select\n" +
                "id, node_name, node_type, data_type, file_type, file_size, file_location,\n" +
                "file_creationtime_in_oss, to_char(file_creationtime_in_oss, 'YYYY-MM-DD HH24:MI') file_creationtime_in_oss_as_string,\n" +
                "start_roptime_in_oss, to_char(start_roptime_in_oss, 'YYYY-MM-DD HH24:MI') start_roptime_in_oss_as_string,\n" +
                "end_roptime_in_oss, to_char(end_roptime_in_oss, 'YYYY-MM-DD HH24:MI') end_roptime_in_oss_as_string \n" +
                "from pm_rop_info\n" +
                "where\n" +
                "1 = 1 \n");
        if (flsSimpleQueryReportRequest.isRopTimeSearchCriteriaEnabled()) {
            sb.append("and start_roptime_in_oss >= TIMESTAMP '" + dateConverter.convertDateToFormattedStringForPostgres(flsSimpleQueryReportRequest.getRopStartTimeInMillis()) + "'\n" +
                    "and end_roptime_in_oss <= TIMESTAMP '" + dateConverter.convertDateToFormattedStringForPostgres(flsSimpleQueryReportRequest.getRopEndTimeInMillis()) + "'\n");
        }
        if (flsSimpleQueryReportRequest.isFileCreationTimeSearchCriteriaEnabled()) {
            sb.append(
                    "and file_creationtime_in_oss >= TIMESTAMP '" + dateConverter.convertDateToFormattedStringForPostgres(flsSimpleQueryReportRequest.getFileCreationStartTimeInMillis()) + "'\n" +
                            "and file_creationtime_in_oss <= TIMESTAMP '" + dateConverter.convertDateToFormattedStringForPostgres(flsSimpleQueryReportRequest.getFileCreationEndTimeInMillis()) + "'\n");
        }
        if (flsSimpleQueryReportRequest.isNodeNameSearchCriteriaEnabled()) {
            sb.append("and UPPER(node_name) ");
            String operator = "LIKE";
            switch (flsSimpleQueryReportRequest.getNodeNameSearchCriteriaOperator()) {
                case "LIKE":
                    sb.append("like '%" + flsSimpleQueryReportRequest.getNodeName().toUpperCase() + "%'\n");
                    break;
                case "NOT_LIKE":
                    sb.append("not like '%" + flsSimpleQueryReportRequest.getNodeName().toUpperCase() + "%'\n");
                    break;
                case "EQUALS":
                    sb.append("= '" + flsSimpleQueryReportRequest.getNodeName().toUpperCase() + "'\n");
                    break;
                case "NOT_EQUALS":
                    sb.append("<> '" + flsSimpleQueryReportRequest.getNodeName().toUpperCase() + "'\n");
                    break;
            }
        }
        if (flsSimpleQueryReportRequest.isNodeTypesSearchCriteriaEnabled()) {
            sb.append("and UPPER(node_type) in (\n" +
                    buildElementsForInClauseWithStrings(flsSimpleQueryReportRequest.getNodeTypes()) +
                            ")\n");
        }
        if (flsSimpleQueryReportRequest.isDataTypesSearchCriteriaEnabled()) {
            sb.append("and UPPER(data_type) in (\n" +
                    buildElementsForInClauseWithStrings(flsSimpleQueryReportRequest.getDataTypes()) +
                    ")\n");
        }
        sb.append("order by node_name asc, node_type asc, data_type asc, start_roptime_in_oss asc, file_creationtime_in_oss asc \n");
        sb.append("LIMIT " + flsSimpleQueryReportRequest.getMaxRecordsToRetrieve());
        return sb.toString();
    }

    private String buildElementsForInClauseWithStrings(final List<String> listOfStrings) {
        StringBuffer elementsForInClause = new StringBuffer();
        String delimiter = "";
        for (String element : listOfStrings) {
            elementsForInClause.append(delimiter);
            elementsForInClause.append("'" + element.toUpperCase() + "'");
            delimiter = ",";

        }
        return elementsForInClause.toString();
    }
}
