package com.notificationapp.backend.service;

import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;

@Service
public class NotificationProxyService {

    private final RestClient restClient;
    private final NotificationAuthService notificationAuthService;

    public NotificationProxyService(
            RestClient notificationRestClient,
            NotificationAuthService notificationAuthService) {
        this.restClient = notificationRestClient;
        this.notificationAuthService = notificationAuthService;
    }

    public ResponseEntity<String> fetchNotifications(Map<String, String> queryParams) {
        return restClient.get()
                .uri(uriBuilder -> buildUri(uriBuilder, queryParams))
                .accept(MediaType.APPLICATION_JSON)
                .headers(this::addAuthorizationHeader)
                .retrieve()
                .toEntity(String.class);
    }

    private java.net.URI buildUri(UriBuilder uriBuilder, Map<String, String> queryParams) {
        UriBuilder builder = uriBuilder.path("/evaluation-service/notifications");

        queryParams.forEach((key, value) -> {
            if (StringUtils.hasText(value)) {
                builder.queryParam(key, value);
            }
        });

        return builder.build();
    }

    private void addAuthorizationHeader(HttpHeaders headers) {
        String token = notificationAuthService.getAccessToken();
        if (StringUtils.hasText(token)) {
            headers.setBearerAuth(token);
        }
    }
}
