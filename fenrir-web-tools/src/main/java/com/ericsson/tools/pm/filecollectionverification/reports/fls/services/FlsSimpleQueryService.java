package com.ericsson.tools.pm.filecollectionverification.reports.fls.services;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.FlsSimpleQueryDao;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.SelectedLiveNode;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsSimpleQueryReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsRecord;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Component
public class FlsSimpleQueryService {


    @Resource
    private FlsSimpleQueryDao flsSimpleQueryDao;

    public List<FlsRecord> findAll(final FlsSimpleQueryReportRequest flsSimpleQueryReportRequest) {
        return flsSimpleQueryDao.findAll(flsSimpleQueryReportRequest);
    }

    private List<String> extractNodeNames(final FlsSimpleQueryReportRequest flsSimpleQueryReportRequest) {
        List<String> nodeNames = new ArrayList();

        for(SelectedLiveNode selectedLiveNode: flsSimpleQueryReportRequest.getSelectedLiveNodes()) {
            nodeNames.add(selectedLiveNode.getNode().getName());
        }

        return nodeNames;
    }
}
