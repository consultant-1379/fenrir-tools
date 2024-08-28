package com.ericsson.tools.pm.filecollectionverification.reports.fls.tools.hello.pm.filecollectionverification.reports;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util.FlsAggregatedRecordRowMapper;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.DataTypeAndExpectedRecords;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.Network;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.Node;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.SelectedLiveNode;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.Simulation;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsMismatchingRecordsReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsAggregatedRecordsOutputRow;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsBaseReportResponse;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsMismatchFinderReportOutputRow;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

public class FlsMismatchRecordReportControllerTest extends AbstractControllerTest {


    @MockBean
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Override
    @Before
    public void setUp() {
        super.setUp();
    }

    @Test
    public void testFindAll() throws Exception {
        String uri = "/reports/fls/mismatchfinder";
        FlsMismatchingRecordsReportRequest flsMismatchingRecordsReportRequest =
                new FlsMismatchingRecordsReportRequest();

        final List<DataTypeAndExpectedRecords> dataTypesAndExpectedRecords = new ArrayList<>();
        final DataTypeAndExpectedRecords statisticalDataTypeAndExpectedRecords = new DataTypeAndExpectedRecords();
        statisticalDataTypeAndExpectedRecords.setDataType("PM_STATISTICAL");
        statisticalDataTypeAndExpectedRecords.setExpectedRecords(10);
        final DataTypeAndExpectedRecords cellTraceDataTypeAndExpectedRecords = new DataTypeAndExpectedRecords();
        cellTraceDataTypeAndExpectedRecords.setDataType("PM_CELLTRACE");
        cellTraceDataTypeAndExpectedRecords.setExpectedRecords(5);
        dataTypesAndExpectedRecords.add(statisticalDataTypeAndExpectedRecords);
        dataTypesAndExpectedRecords.add(cellTraceDataTypeAndExpectedRecords);
        flsMismatchingRecordsReportRequest.setDataTypesAndExpectedRecords(dataTypesAndExpectedRecords);
        flsMismatchingRecordsReportRequest.setRopIntervalInMinutes(15);
        flsMismatchingRecordsReportRequest.setShowOnlyMismatchingRecords(true);
        flsMismatchingRecordsReportRequest.setMaxRecordsToRetrieve(10000);
        flsMismatchingRecordsReportRequest.setRopStartTimeInMillis(1562713200000L);
        flsMismatchingRecordsReportRequest.setRopEndTimeInMillis(1562799600000L);

        Network network = new Network();
        network.setId("8b330d2a-39e5-4e86-aea0-90719ddc162b");
        network.setName("NR-MixedMode");
        network.setType("NETWORK");
        Simulation simulation = new Simulation();
        simulation.setId("a8a83c6e-5c18-4a5f-bbb0-56dbf41b279d");
        simulation.setName("NR02");
        simulation.setType("SIMULATION");
        Node node1 = new Node();
        node1.setId("5a6aa7d8-653f-4973-af92-e4fbf3739ab2");
        node1.setName("NR02gNodeBRadio00010");
        node1.setType("NODE");
        node1.setIp("192.168.102.138");
        node1.setNeType("RadioNode");
        Node node2 = new Node();
        node2.setId("6739a5e0-73ce-431a-9c99-705f9facef57");
        node2.setName("NR01gNodeBRadio00001");
        node2.setType("NODE");
        node2.setIp("192.168.103.213");
        node2.setNeType("RadioNode");


        final List<SelectedLiveNode> selectedLiveNodes = new ArrayList<>();
        SelectedLiveNode selectedLiveNode1 = new SelectedLiveNode();
        selectedLiveNode1.setNetwork(network);
        selectedLiveNode1.setSimulation(simulation);
        selectedLiveNode1.setNode(node1);
        SelectedLiveNode selectedLiveNode2 = new SelectedLiveNode();
        selectedLiveNode2.setNetwork(network);
        selectedLiveNode2.setSimulation(simulation);
        selectedLiveNode2.setNode(node2);
        selectedLiveNodes.add(selectedLiveNode1);
        selectedLiveNodes.add(selectedLiveNode2);
        flsMismatchingRecordsReportRequest.setSelectedLiveNodes(selectedLiveNodes);

        List<FlsMismatchFinderReportOutputRow> flsMismatchFinderReportOutputRowList = new ArrayList<>();
        FlsMismatchFinderReportOutputRow flsMismatchFinderReportOutputRow_1 = new FlsMismatchFinderReportOutputRow();
        FlsMismatchFinderReportOutputRow flsMismatchFinderReportOutputRow_2 = new FlsMismatchFinderReportOutputRow();
        flsMismatchFinderReportOutputRowList.add(flsMismatchFinderReportOutputRow_1);
        flsMismatchFinderReportOutputRowList.add(flsMismatchFinderReportOutputRow_2);
        //Mockito.when(namedParameterJdbcTemplate.query(anyString(), any(FlsMismatchFinderRowMapper.class)))
        //        .thenReturn(flsMismatchFinderReportOutputRowList);
        List<FlsAggregatedRecordsOutputRow> flsAggregatedRecordsOutputRowList = new ArrayList();
        FlsAggregatedRecordsOutputRow flsAggregatedRecordsOutputRow_1 = new FlsAggregatedRecordsOutputRow();
        flsAggregatedRecordsOutputRow_1.setNodeName("NR01gNodeBRadio00001");
        flsAggregatedRecordsOutputRow_1.setStrippedNodeName("NR01gNodeBRadio00001");
        flsAggregatedRecordsOutputRow_1.setDataType("PM_STATISTICAL");
        flsAggregatedRecordsOutputRow_1.setNodeType("RadioNode");
        flsAggregatedRecordsOutputRow_1.setRopStartTimeInMillis(1562748300000L);
        flsAggregatedRecordsOutputRow_1.setRopEndTimeInMillis(1562749200000L);
        flsAggregatedRecordsOutputRow_1.setNumFiles(1);
        FlsAggregatedRecordsOutputRow flsAggregatedRecordsOutputRow_2 = new FlsAggregatedRecordsOutputRow();
        flsAggregatedRecordsOutputRow_2.setNodeName("NR01gNodeBRadio00001");
        flsAggregatedRecordsOutputRow_2.setStrippedNodeName("NR01gNodeBRadio00001");
        flsAggregatedRecordsOutputRow_2.setDataType("PM_CELLTRACE");
        flsAggregatedRecordsOutputRow_2.setNodeType("RadioNode");
        flsAggregatedRecordsOutputRow_2.setRopStartTimeInMillis(1562748300000L);
        flsAggregatedRecordsOutputRow_2.setRopEndTimeInMillis(1562749200000L);
        flsAggregatedRecordsOutputRow_2.setNumFiles(0);
        flsAggregatedRecordsOutputRowList.add(flsAggregatedRecordsOutputRow_1);
        flsAggregatedRecordsOutputRowList.add(flsAggregatedRecordsOutputRow_2);
        Mockito.when(namedParameterJdbcTemplate.query(anyString(), any(FlsAggregatedRecordRowMapper.class)))
                .thenReturn(flsAggregatedRecordsOutputRowList);
        String inputJson = super.mapToJson(flsMismatchingRecordsReportRequest);
        MvcResult mvcResult = mvc.perform(MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON_VALUE).content(inputJson)).andReturn();

        int status = mvcResult.getResponse().getStatus();
        assertEquals(200, status);
        String content = mvcResult.getResponse().getContentAsString();
        FlsBaseReportResponse flsBaseReportResponse =
                super.mapFromJson(content);
        assertEquals(flsBaseReportResponse.getRecords().size(), 384);
    }
}
