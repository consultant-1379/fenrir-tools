package com.ericsson.tools.pm.filecollectionverification.reports.fls.services;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.FlsDupsFinderDao;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.SelectedLiveNode;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsDupRecordsReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsDupRecordsReportOutputRow;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Component
public class FlsDupFinderService {

    @Resource
    private FlsDupsFinderDao flsDupsFinderDao;

    public List<FlsDupRecordsReportOutputRow> findAll(final FlsDupRecordsReportRequest flsDupRecordsReportRequest) {
        final List<FlsDupRecordsReportOutputRow> queryResult = flsDupsFinderDao.findAll((extractNodeNames(flsDupRecordsReportRequest)),
                flsDupRecordsReportRequest.getDataTypes(), flsDupRecordsReportRequest.getRopStartTimeInMillis(),
                flsDupRecordsReportRequest.getRopEndTimeInMillis(),
                flsDupRecordsReportRequest.getMaxFilesExpected(),
                flsDupRecordsReportRequest.getMaxRecordsToRetrieve());

        enrichQueryResultWithNetworkAndSimulation(flsDupRecordsReportRequest, queryResult);

        return queryResult;
    }

    private List<String> extractNodeNames(FlsDupRecordsReportRequest flsDupRecordsReportRequest) {
        List<String> nodeNames = new ArrayList();

        for(SelectedLiveNode selectedLiveNode: flsDupRecordsReportRequest.getSelectedLiveNodes()) {
            nodeNames.add(selectedLiveNode.getNode().getName());
        }

        return nodeNames;
    }

    private void enrichQueryResultWithNetworkAndSimulation(final FlsDupRecordsReportRequest flsDupRecordsReportRequest,
                                                           final List<FlsDupRecordsReportOutputRow> flsDupRecordsReportOutputRows) {
        for (FlsDupRecordsReportOutputRow flsDupRecordsReportOutputRow: flsDupRecordsReportOutputRows) {
          SelectedLiveNode selectedLiveNode = findSelectedLiveNode(flsDupRecordsReportRequest, flsDupRecordsReportOutputRow.getNodeName());
            flsDupRecordsReportOutputRow.setNetwork(selectedLiveNode.getNetwork().getName());
            flsDupRecordsReportOutputRow.setSimulation(selectedLiveNode.getSimulation().getName());
        }
    }

    private SelectedLiveNode findSelectedLiveNode(final FlsDupRecordsReportRequest flsDupRecordsReportRequest, final String nodeName) {
        for (SelectedLiveNode selectedLiveNode : flsDupRecordsReportRequest.getSelectedLiveNodes()) {
          if (selectedLiveNode.getNode().getName().equals(nodeName)) {
              return selectedLiveNode;
          }
        }

        return new SelectedLiveNode();
    }
}
