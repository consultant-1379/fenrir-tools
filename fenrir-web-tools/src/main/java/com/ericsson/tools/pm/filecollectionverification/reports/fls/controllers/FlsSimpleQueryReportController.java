package com.ericsson.tools.pm.filecollectionverification.reports.fls.controllers;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsSimpleQueryReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsBaseReportResponse;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.FlsReportResponseWrapper;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.FlsSimpleQueryService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
@RequestMapping("/reports/fls")
public class FlsSimpleQueryReportController extends FlsReportResponseWrapper {

    @Resource
    private FlsSimpleQueryService flsSimpleQueryService;

    @PostMapping(value = "/simpleQuery")
    public FlsBaseReportResponse findAll(@RequestBody() final FlsSimpleQueryReportRequest flsSimpleQueryReportRequest) {
        FlsBaseReportResponse flsBaseReportResponse =
                this.wrap(flsSimpleQueryReportRequest,
                flsSimpleQueryService.findAll(flsSimpleQueryReportRequest));

        return flsBaseReportResponse;
    }
}
