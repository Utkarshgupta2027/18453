package com.notificationapp.backend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.notificationapp.backend.config.NotificationApiProperties;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Service
public class NotificationAuthService {

    private static final long TOKEN_REFRESH_SKEW_SECONDS = 60;

    private final NotificationApiProperties properties;
    private final RestClient authClient;
    private String cachedToken;
    private Instant cachedTokenExpiry = Instant.EPOCH;

    public NotificationAuthService(NotificationApiProperties properties) {
        this.properties = properties;
        this.authClient = RestClient.builder().build();
    }

    public synchronized String getAccessToken() {
        if (StringUtils.hasText(cachedToken) && Instant.now().isBefore(cachedTokenExpiry)) {
            return cachedToken;
        }

        if (hasAuthCredentials()) {
            AuthResponse response = requestFreshToken();
            cachedToken = response.accessToken();
            cachedTokenExpiry = resolveExpiry(response.expiresIn());
            return cachedToken;
        }

        return properties.getToken();
    }

    private boolean hasAuthCredentials() {
        return StringUtils.hasText(properties.getEmail())
                && StringUtils.hasText(properties.getName())
                && StringUtils.hasText(properties.getRollNo())
                && StringUtils.hasText(properties.getAccessCode())
                && StringUtils.hasText(properties.getClientId())
                && StringUtils.hasText(properties.getClientSecret());
    }

    private AuthResponse requestFreshToken() {
        Map<String, String> body = Map.of(
                "email", properties.getEmail(),
                "name", properties.getName(),
                "rollNo", properties.getRollNo(),
                "accessCode", properties.getAccessCode(),
                "clientID", properties.getClientId(),
                "clientSecret", properties.getClientSecret());

        return authClient.post()
                .uri(properties.getAuthUrl())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(AuthResponse.class);
    }

    private Instant resolveExpiry(long expiresIn) {
        long now = Instant.now().getEpochSecond();
        long expiryEpochSeconds = expiresIn > now ? expiresIn : now + expiresIn;
        return Instant.ofEpochSecond(Math.max(now, expiryEpochSeconds - TOKEN_REFRESH_SKEW_SECONDS));
    }

    private record AuthResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("expires_in") long expiresIn) {
    }
}
