/*------------------------------------------------------------------------------
 *******************************************************************************
 * COPYRIGHT Ericsson 2019
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 *----------------------------------------------------------------------------*/

package com.ericsson.oss.jenkins.loganalyser;

public enum TestLoop {
        //REST endpoints provided by MultiClmeEndPoint.java in 'metrics-services' repo
        RFA_250("http://de.lmera.ericsson.se/metrics-services/rfa-trends-by-teams-failreport"),
        LONG_LOOP("http://de.lmera.ericsson.se/metrics-services/long-loop-trends-by-teams");

        public final String url;

        private TestLoop(String url) {
            this.url = url;
    }

}
