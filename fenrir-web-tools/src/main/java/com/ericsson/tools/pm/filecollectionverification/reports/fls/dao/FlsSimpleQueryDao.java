package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsSimpleQueryReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsRecord;

import java.util.List;

public interface FlsSimpleQueryDao {

    List<FlsRecord> findAll(final FlsSimpleQueryReportRequest flsSimpleQueryReportRequest);
}
