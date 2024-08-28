package com.ericsson.tools.pm.filecollectionverification.reports.fls.model.io;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsBaseReportResponse;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsRecord;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.StreamSupport;

public class FlsMismatchRecordReportResponseDeserialiser extends JsonDeserializer<FlsBaseReportResponse> {
    static final TypeReference<List<FlsBaseReportResponse>> listType = new TypeReference<List<FlsBaseReportResponse>>() {};

    @Override
    public FlsBaseReportResponse deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
        FlsBaseReportResponse flsBaseReportResponse = new FlsBaseReportResponse();
        JsonNode node = jsonParser.getCodec().readTree(jsonParser);
        flsBaseReportResponse.setMaxRecordsToRetrieve(node.get("maxRecordsToRetrieve").asInt());
        flsBaseReportResponse.setMaxRecordsRetrieved(node.get("maxRecordsRetrieved").asInt());
        flsBaseReportResponse.setMaxRecordsRetrievedMessage(node.get("maxRecordsRetrievedMessage").asText());
        ArrayNode arrayNode = (ArrayNode) node.get("records");
        List<FlsRecord> flsRecordList = new ArrayList();
        flsBaseReportResponse.setRecords(flsRecordList);
        StreamSupport.stream(arrayNode.spliterator(), false).forEach(element -> {
            FlsRecord flsRecord = new FlsRecord();
            flsRecord.setRopStartTimeInMillis(element.get("ropStartTimeInMillis").asLong());
            flsRecordList.add(flsRecord);
        });
        return flsBaseReportResponse;
    }
}
