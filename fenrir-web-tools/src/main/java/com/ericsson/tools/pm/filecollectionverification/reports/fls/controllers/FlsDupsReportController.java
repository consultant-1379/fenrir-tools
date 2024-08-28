package com.ericsson.tools.pm.filecollectionverification.reports.fls.controllers;

import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.request.FlsDupRecordsReportRequest;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.model.response.FlsBaseReportResponse;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.FlsDupFinderService;
import com.ericsson.tools.pm.filecollectionverification.reports.fls.services.FlsReportResponseWrapper;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
@RequestMapping("/reports/fls")
public class FlsDupsReportController extends FlsReportResponseWrapper {

    @Resource
    FlsDupFinderService flsDupFinderService;

    @PostMapping(value = "/dupsfinder")
    public FlsBaseReportResponse findAll(@RequestBody() final FlsDupRecordsReportRequest flsDupRequest) {

        FlsBaseReportResponse flsBaseReportResponse =
                this.wrap(flsDupRequest,
                        flsDupFinderService.findAll(flsDupRequest));

        return flsBaseReportResponse;
    }
}
