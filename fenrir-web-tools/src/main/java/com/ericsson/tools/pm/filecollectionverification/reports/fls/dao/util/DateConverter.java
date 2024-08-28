package com.ericsson.tools.pm.filecollectionverification.reports.fls.dao.util;

import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

@Component
public class DateConverter {

    public String convertLocalDateTimeToFormattedString(final LocalDateTime localDateTime) {
        Instant localDateTimeInstant = localDateTime.toInstant(ZoneOffset.systemDefault().getRules().getOffset(Instant.now()));
        Date date = Date.from(localDateTimeInstant);
        return this.convertDateToFormattedStringForPostgres(date.getTime());
    }

    public long convertLocalDateTimeToMillis(final LocalDateTime localDateTime) {
        Instant localDateTimeInstant = localDateTime.toInstant(ZoneOffset.systemDefault().getRules().getOffset(Instant.now()));
        Date date = Date.from(localDateTimeInstant);
        return date.getTime();
    }

    public String convertDateToFormattedStringForPostgres(final long dateInMillis) {
        // Postgresql format: 2019-05-09 23:59:59
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return format.format(new Date(dateInMillis));
    }
}
