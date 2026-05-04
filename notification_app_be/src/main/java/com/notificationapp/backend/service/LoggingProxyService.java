package com.notificationapp.backend.service;

import com.notificationapp.backend.config.NotificationApiProperties;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Service
public class LoggingProxyService {

    private final NotificationApiProperties properties;
    private final NotificationAuthService notificationAuthService;
    private final RestClient restClient;

    public LoggingProxyService(
            NotificationApiProperties properties,
            NotificationAuthService notificationAuthService) {
        this.properties = properties;
        this.notificationAuthService = notificationAuthService;
        this.restClient = RestClient.builder().build();
    }

    public ResponseEntity<String> sendLog(Map<String, Object> logEntry, String tokenOverride) {
        String token = notificationAuthService.getAccessToken(tokenOverride);

        return restClient.post()
                .uri(properties.getLogUrl())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> {
                    if (StringUtils.hasText(token)) {
                        headers.setBearerAuth(token);
                    }
                })
                .body(logEntry)
                .retrieve()
                .toEntity(String.class);
    }
}
