package com.notificationapp.backend.service;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
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

    public ResponseEntity<String> fetchNotifications(Map<String, String> queryParams, String tokenOverride) {
        String token = notificationAuthService.getAccessToken(tokenOverride);
        if (!StringUtils.hasText(token)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Save a valid token or generate one before loading notifications");
        }

        try {
            return restClient.get()
                    .uri(uriBuilder -> buildUri(uriBuilder, queryParams))
                    .accept(MediaType.APPLICATION_JSON)
                    .headers(headers -> headers.setBearerAuth(token))
                    .retrieve()
                    .toEntity(String.class);
        } catch (RestClientResponseException error) {
            throw new ResponseStatusException(
                    error.getStatusCode(),
                    resolveApiErrorMessage("Notification API request failed", error),
                    error);
        }
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

    private String resolveApiErrorMessage(String fallback, RestClientResponseException error) {
        String responseBody = error.getResponseBodyAsString();
        if (StringUtils.hasText(responseBody)) {
            return fallback + ": " + responseBody;
        }

        return fallback + " with status " + error.getStatusCode().value();
    }
}
