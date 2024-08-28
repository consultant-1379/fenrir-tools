package com.ericsson.tools.pm.filecollectionverification.reports.fls.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

@Component
public class ResponseTrackerRepository {
    private Logger logger = LoggerFactory.getLogger(ResponseTrackerRepository.class);

    private Map<String, ResponseTracker> requests;
    private Lock lock;

    @Resource
    private FlsReportResponseWrapper flsReportResponseWrapper;

    public ResponseTrackerRepository() {
        this.requests = new HashMap<>();
        this.lock = new ReentrantLock();
    }

    public ResponseTracker getTracker(final String trackerId) {
        ResponseTracker responseTracker = null;

        this.lock.lock();
        try {
            responseTracker = this.requests.get(trackerId);
        } finally {
            this.lock.unlock();
        }

        return responseTracker;
    }

    public ResponseTracker getTrackerIfReportGenerationIsComplete(final String trackerId) {
        ResponseTracker responseTracker = null;

        this.lock.lock();
        try {
            responseTracker = this.getTracker(trackerId);

            if (responseTracker != null && responseTracker.isRequestCompleted()) {
                responseTracker.setFlsBaseReportResponse(flsReportResponseWrapper.wrap(responseTracker.getFlsBaseReportRequest(),
                        responseTracker.getReportOutputRecordList()));
                responseTracker.setFlsBaseReportRequest(null);
                responseTracker.setReportOutputRecordList(null);
                this.removeTracker(trackerId);
                logger.info("Tracker Id '{}' removed from cache", trackerId);
            }
        } finally {
            this.lock.unlock();
        }

        return responseTracker;
    }

    public ResponseTracker addTracker(final ResponseTracker responseTracker) {
        this.lock.lock();
        try {
            this.requests.put(responseTracker.getTrackerId(), responseTracker);
        } finally {
            this.lock.unlock();
        }
        return responseTracker;
    }

    public ResponseTracker removeTracker(final String trackerId) {
        ResponseTracker storedResponseTracker = null;
        this.lock.lock();
        try {
            storedResponseTracker = this.requests.get(trackerId);
            if (storedResponseTracker == null) {
                throw new RuntimeException("Response tracker with id '"
                        + trackerId  + "' was not found in the registry ");
            }
            this.requests.remove(storedResponseTracker.getTrackerId());
        } finally {
            this.lock.unlock();
        }
        return storedResponseTracker;
    }
}
