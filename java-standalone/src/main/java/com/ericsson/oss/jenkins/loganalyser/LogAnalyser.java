package com.ericsson.oss.jenkins.loganalyser;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

/**
 * Quick and dirty tool for analysing jenkins logs taken from an Allure
 * report, finding and cataloging occurrences of a specific String across
 * all raw Jenkins logs.
 * <p>
 * The idea is to help identify whether an error appears to actually be
 * specific to a particular suite, PM only, or across all testware being
 * executed.
 */
public class LogAnalyser {

    //CHANGE THESE AS NEEDED BEFORE RUNNING!!
    /**
     * TARGET_STRINGS : the string array you're searching for. You can search array of strings in the same line of the log file.
     * TEST_LOOP : Choose between RFA_250 or LONG_LOOP
     * SPRINT_NUMBER : The sprint number you want to analyse (only applicable for RFA 250)
     * targetIsos : Add the ISOs you want to analyse here in 'targetIsos.
     *              For RFA 250 leave the list empty to execute against all ISOs from sprint defined by SPRINT_NUMBER
     *              For Long Loop enter the first and last IOS (of the same sprint) you want to examine. use 0 and 999 as minor version to get all
     */
    private static final String TARGET_STRINGS[] = {"504 Gateway Time-out", "SubscriptionCrudRestOperatorImpl"};
    private static final TestLoop TEST_LOOP = TestLoop.LONG_LOOP;
    private static final String SPRINT_NUMBER = "19.15";
    private static final List<String> targetIsos = Arrays.asList("1.81.00", "1.81.999");
    private static final String LOG_FILE_ROOT_URL = "te-console-logs/";
    private static int totalTargetInstances = 0;
    private static int totalIsoTargetInstances = 0;

    public static final void main(final String[] args) throws Exception {
        JSONArray isoArrayFromTrendTool = getIsoArrayFromTrendTool();
        String allureUrl;
        String isoVersion;

        for (Object rawObjectFromTrendTool : isoArrayFromTrendTool) {
            JSONObject isoDetailsFromTrendTool = (JSONObject) rawObjectFromTrendTool;
            isoVersion = ((String) isoDetailsFromTrendTool.get("isoVersion"));
            allureUrl = (String) isoDetailsFromTrendTool.get("allureUrl");
            try{
                allureUrl = sanitiseAllureUrl(
                        (String) isoDetailsFromTrendTool.get("allureUrl"));
            } catch(Exception e){
                System.out.println(String.format("Unable to sanitise ISO version %s Allure URL: (%s)", isoVersion, allureUrl));
                continue;
            }

            totalIsoTargetInstances = 0;

            //TODO: eeoiker Specific ISOs can be specified in the POST data, should use that, see RFATrendByTeamsObject.java
            //If we are restricting to specific ISOs for RFA250, and the current 'isoVersion' is not one we're interested in, then continue
            if (TestLoop.RFA_250.equals(TEST_LOOP) && !targetIsos.isEmpty() && !targetIsos.contains(isoVersion)) {
                continue;
            }
            System.out.println();
            System.out.println(String.format("ENM ISO version: %s (%s)", isoVersion, allureUrl + "data/jenkins-logs.json"));
            for (String targetString : TARGET_STRINGS) {
                System.out.println(String.format("Target string  : '%s'", targetString));
            }
            for (String logFileUrl : getLogFileUrls(allureUrl, "data/jenkins-logs.json")) {
                processLogFileUrl(logFileUrl); // method to search an array of strings in a line
            }
            System.out.println(String.format("Instances in ISO %s: %s", isoVersion, totalIsoTargetInstances));
            System.out.println();
        }
        System.out.println(String.format("Total instance count: %s", totalTargetInstances));
    }

    private static String sanitiseAllureUrl(final String allureUrl) throws Exception {
        String sanitisedAllureUrl;
        String[] allureUrlParts = allureUrl.split("(http://)(.*)ericsson.se/[a-zA-Z0-9]{8}[-][a-zA-Z0-9]{4}[-][a-zA-Z0-9]{4}[-][a-zA-Z0-9]{4}[-][a-zA-Z0-9]{12}", 2);
        if(allureUrlParts[0].isEmpty() && allureUrlParts[1].isEmpty()) {
            sanitisedAllureUrl  = allureUrl + "/";
        } else if(("/").equals(allureUrlParts[1])){
            sanitisedAllureUrl  = allureUrl;
        } else if(allureUrlParts[1].matches("(/)(.*)")){
            sanitisedAllureUrl  = allureUrl.substring(0,allureUrl.lastIndexOf(allureUrlParts[1])+1);
        } else {
            throw new Exception("Unable to sanitise Allure URL");
        }
        return sanitisedAllureUrl;
    }

    private static JSONArray getIsoArrayFromTrendTool() throws Exception {
        final String sprintPostsData; //POST data specified in RFATrendByTeamsObject.java
        if (TestLoop.RFA_250.equals(TEST_LOOP)) {
            System.out.println(String.format("RFA 250, Sprint Number: %s", SPRINT_NUMBER));
            sprintPostsData = String.format("{\"drop\": \"%s\"}", SPRINT_NUMBER);
        } else {
            System.out.println(String.format("Long Loop, ISOs %s - %s", targetIsos.get(0), targetIsos.get(1)));
            sprintPostsData = String.format("{\"isosFrom\": \"%s\",\"isosTo\": \"%s\"}", targetIsos.get(0), targetIsos.get(1));
        }
        System.out.println();

        BufferedReader bufferedReader = getBufferedReaderFromUrl(TEST_LOOP.url, "POST", sprintPostsData);
        JSONParser parser = new JSONParser();
        return (JSONArray) parser.parse(bufferedReader);
    }

    private static Set<String> getLogFileUrls(final String allureUrl, final String jenkinsLogJsonUrl) throws Exception {
        Set<String> fileURLs = new HashSet<>();
        String name;
        String logFileUrl;
        BufferedReader bufferedReader = getBufferedReaderFromUrl(allureUrl + jenkinsLogJsonUrl);
        JSONParser parser = new JSONParser();
        JSONArray jsonArray = (JSONArray) ((JSONObject) parser.parse(bufferedReader)).get("logFiles");
        for (Object object : jsonArray) {
            JSONObject jsonObject = (JSONObject) object;
            name = (String) jsonObject.get("name");
            logFileUrl = allureUrl + LOG_FILE_ROOT_URL + name;
            fileURLs.add(logFileUrl);
        }
        return fileURLs;
    }

    private static void processLogFileUrl(final String logFileUrl) throws Exception {
        BufferedReader bufferedReader = getBufferedReaderFromUrl(logFileUrl);
        String logEntry;
        int localTargetInstances = 0;
        boolean printLogFileUrl = true;
        while ((logEntry = bufferedReader.readLine()) != null) {
            if (logEntryContainsTargetStrings(logEntry)) {
                totalTargetInstances++;
                totalIsoTargetInstances++;
                localTargetInstances++;
                if (printLogFileUrl) {
                    System.out.println("\t" + logFileUrl);//Print once per log file, only if target found
                    printLogFileUrl = false;
                }
                //TODO: This is a little problematic...Log entry can be spread over several lines. Might make more sense not to print anything at all
                //and just give totals on a per suite basis
                //System.out.println("\t\t" + (VERBOSE ? inputLine : getTimestampFromLogLine(inputLine)));
            }
        }
        if (!printLogFileUrl) {
            System.out.println("\t\t" + localTargetInstances + " instances in suite");
        }
    }

    private static String getTimestampFromLogLine(final String logLine) {
        //Quickly grab the leading timestamp with some magic numbers, Hey Presto!
        if (logLine.length() > 24) {
            return logLine.substring(0, 23);
        }
        return logLine;
    }

    private static BufferedReader getBufferedReaderFromUrl(final String inputURL) throws Exception {
        return getBufferedReaderFromUrl(inputURL, "Anything other than POST", null);
    }

    private static BufferedReader getBufferedReaderFromUrl(final String inputUrl, final String requestMethod, final String postData)
            throws Exception {
        URL url = new URL(inputUrl);
        HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
        if ("POST".equals(requestMethod)) {
            urlConnection.setDoOutput(true);
            urlConnection.setRequestMethod(requestMethod);
            urlConnection.setRequestProperty("Content-Type", "application/json");
            try (DataOutputStream wr = new DataOutputStream(urlConnection.getOutputStream())) {
                wr.write(postData.getBytes());
            }
        }
        return new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));
    }

    private static boolean logEntryContainsTargetStrings(final String logEntry){
        boolean containsAllTargetStrings = true;
        for (String targetString : TARGET_STRINGS) {
            if (!logEntry.contains(targetString)) {
                containsAllTargetStrings = false;
                break;
            }
        }
        return containsAllTargetStrings;
    }
}