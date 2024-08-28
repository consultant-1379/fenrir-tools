package com.ericsson.oss.gerrit.servicegrouplookup;

import org.apache.commons.lang3.StringUtils;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A tool to quickly check all service groups and see if they are on RHEL, SLES, EAP6 or EAP7.
 * Please feel free to modify, this only provides a foundation for YOU to work on!
 * This is a quick solution to help get information on all Cloud Service Groups on Gerrit.
 * TODO:
 * - Obtain the cookie from your web browser by going into any ServiceGroup's Dockerfile and pressing F12 (Chrome/Firefox/Edge) to bring up developer tools.
 * - Once in console, open the network tab, then click on Dockerfile, and you should see Cookies in Headers
 * - Copy the cookie value with the semicolon included and replace it with the cookie String content on line 30.
 * - Run the Driver class
 * - For more info: https://confluence-oss.seli.wh.rnd.internal.ericsson.com/pages/viewpage.action?pageId=387927467
 **/

public class ServiceGroupLookup {
    private String cookie = "GerritAccount=[INPUT YOUR COOKIE HERE, DON'T FORGET THE SEMICOLON]";
    private List<String> sgNames;
    private static String dockerFileURL = "https://gerrit.ericsson.se/plugins/gitiles/OSS/com.ericsson.oss.containerisation/eric-enmsg-%s/+/master/Dockerfile";
    private final static String gerritListURL = "https://gerrit.ericsson.se/projects/?m=enmsg&n=500&type=ALL&d";
    /*
     * Change println colour for nicer output by using ANSI escape sequences, which control color, styling and other options on video text terminals and terminal emulators
     * The reset code turns off all ANSI attributes set so far, which should return the console to its defaults. It's useful if you don't know the default color or are also using some of the other attributes like background color, font styles
     * It generally works for Unix shell prompts; however, it doesn't work for Windows Command Prompt (Although, it does work for Cygwin)
    */
    private static final String ANSI_RED = "\u001B[31m";
    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_GREEN = "\u001B[32m";

    //Constructor
    public ServiceGroupLookup() {
        sgNames = getSgNames(cookie);
    }

    private HttpURLConnection establishHttpConnection (final String url) {
        HttpURLConnection httpURLConnection = null;
        try {
            URL customUrl = new URL(url);
            httpURLConnection = (HttpURLConnection) customUrl.openConnection();
            httpURLConnection.setRequestProperty("Cookie", cookie);
            httpURLConnection.setRequestMethod("GET");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return httpURLConnection;
    }

    private BufferedReader printDockerFileSGName(final String sgName, final String cookie) {
        //Using a Gerrit cookie to make a request to SGs Dockerfiles
        BufferedReader bufferedReader = null;
        try {
            System.out.println(ANSI_GREEN + "-------------------" + sgName + "--------------------" + ANSI_RESET);
            HttpURLConnection httpURLConnection = establishHttpConnection(String.format(dockerFileURL, sgName));
            bufferedReader = new BufferedReader(new InputStreamReader(httpURLConnection.getInputStream()));
        } catch (IOException e) {
            System.out.println(ANSI_RED + "This SG does not contain a Dockerfile!" + ANSI_RESET);
        }
        return bufferedReader;
    }

    private List<String> getSgNames(final String cookie) {
        //Using the cookie again to fetch the Gerrit URL page as JSON with our SG names and parse the JSON, then add it to an arraylist
        final List<String> arrayList = new ArrayList<>();
        try {
            HttpURLConnection httpURLConnection = establishHttpConnection(gerritListURL);
            httpURLConnection.setRequestProperty("Accept", "application/json");
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(httpURLConnection.getInputStream()));
            //Skipping the first line of the JSON file as it is not needed
            bufferedReader.readLine();
            String sgJson = bufferedReader.readLine();
            JSONParser jsonParser = new JSONParser();
            JSONObject jsonObject = (JSONObject) jsonParser.parse(sgJson);
            Set<String> keySet = jsonObject.keySet();
            for(String s: keySet){
                Pattern regexPattern = Pattern.compile("(eric-enmsg-)([A-Za-z-]*)");
                Matcher matcher = regexPattern.matcher(s);
                if(matcher.find()){
                    arrayList.add((matcher.group(0).replace("eric-enmsg-", "")));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ParseException e) {
            System.out.println("Could not parse JSON file");
        }
        return arrayList;
    }

    public void findServiceGroupVersion()  {
        String line;
        //Iterating through Service Group names
        for (final String sgName : sgNames) {
            try {
                BufferedReader bufferedReader = printDockerFileSGName(sgName, cookie);
                if (bufferedReader != null) {
                    StringBuilder stringBuilder = new StringBuilder();
                    while ((line = bufferedReader.readLine()) != null) {
                        stringBuilder.append(line);
                    }
                    bufferedReader.close();

                    //Regex used to filter out special characters
                    String plainText = stringBuilder.toString().replaceAll("(?s)<[^>]*>(\\s*<[^>]*>)*", "");

                    if (plainText.contains("eric-enm-sles-eap7")) {
                        System.out.println("SLES EAP7 version is :" + StringUtils.substringBetween(plainText, "ERIC_ENM_SLES_EAP7_IMAGE_TAG=", "FROM"));
                    } else if (plainText.contains("eric-enm-sles-eap6")) {
                        System.out.println("SLES EAP6 version is : " + StringUtils.substringBetween(plainText, "ERIC_ENM_SLES_EAP6_IMAGE_TAG=", "FROM"));
                    } else if (plainText.contains("eric-enm-rhel-jbossconfig")) {
                        System.out.println("JBOSS RHEL version is : " + StringUtils.substringBetween(plainText, "ERIC_ENM_RHEL_JBOSSCONFIG_IMAGE_TAG=", "FROM"));
                    } else if (plainText.contains("eric-enm-rhel6base")) {
                        System.out.println("RHEL6BASE version is : " + StringUtils.substringBetween(plainText, "ERIC_ENM_RHEL6BASE_IMAGE_TAG=", "FROM"));
                    } else if (plainText.contains("eric-enm-sles-base")) {
                        System.out.println("SLESBASE version is : " + StringUtils.substringBetween(plainText, "ERIC_ENM_SLES_BASE_IMAGE_TAG=", "FROM"));
                    } else if (plainText.contains("eric-enm-httpd-sidecar")) {
                        System.out.println("HTTPD version is : " + StringUtils.substringBetween(plainText, "ERIC_ENM_HTTPD_SIDECAR_IMAGE_TAG=", "FROM"));
                    } else {
                        System.out.println("Custom image used, please check repo");
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}