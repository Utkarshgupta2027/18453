package com.notificationapp.backend.service;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.notificationapp.backend.config.NotificationApiProperties;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

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

    public synchronized String getAccessToken(String tokenOverride) {
        if (StringUtils.hasText(tokenOverride)) {
            return tokenOverride.trim();
        }

        if (StringUtils.hasText(cachedToken) && Instant.now().isBefore(cachedTokenExpiry)) {
            return cachedToken;
        }

        if (hasAuthCredentials()) {
            AuthResponse response = requestFreshToken();
            if (response == null || !StringUtils.hasText(response.accessToken())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Notification auth service did not return an access token");
            }
            cachedToken = response.accessToken();
            cachedTokenExpiry = resolveExpiry(response.expiresIn());
            return cachedToken;
        }

        return properties.getToken();
    }

    public TokenResponse generateAccessToken(AuthRequest request) {
        validateAuthRequest(request);
        AuthResponse response = requestFreshToken(Map.of(
                "email", request.email(),
                "name", request.name(),
                "rollNo", request.rollNo(),
                "accessCode", request.accessCode(),
                "clientID", request.clientId(),
                "clientSecret", request.clientSecret()));

        if (response == null || !StringUtils.hasText(response.accessToken())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Notification auth service did not return an access token");
        }

        return new TokenResponse(response.accessToken(), response.expiresIn());
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
        return requestFreshToken(Map.of(
                "email", properties.getEmail(),
                "name", properties.getName(),
                "rollNo", properties.getRollNo(),
                "accessCode", properties.getAccessCode(),
                "clientID", properties.getClientId(),
                "clientSecret", properties.getClientSecret()));
    }

    private AuthResponse requestFreshToken(Map<String, String> body) {
        try {
            return authClient.post()
                    .uri(properties.getAuthUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(AuthResponse.class);
        } catch (RestClientResponseException error) {
            throw new ResponseStatusException(
                    error.getStatusCode(),
                    resolveApiErrorMessage("Token generation failed", error),
                    error);
        }
    }

    private Instant resolveExpiry(long expiresIn) {
        long now = Instant.now().getEpochSecond();
        long expiryEpochSeconds = expiresIn > now ? expiresIn : now + expiresIn;
        return Instant.ofEpochSecond(Math.max(now, expiryEpochSeconds - TOKEN_REFRESH_SKEW_SECONDS));
    }

    private void validateAuthRequest(AuthRequest request) {
        if (request == null
                || !StringUtils.hasText(request.email())
                || !StringUtils.hasText(request.name())
                || !StringUtils.hasText(request.rollNo())
                || !StringUtils.hasText(request.accessCode())
                || !StringUtils.hasText(request.clientId())
                || !StringUtils.hasText(request.clientSecret())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email, name, roll number, access code, client id, and client secret are required");
        }
    }

    private String resolveApiErrorMessage(String fallback, RestClientResponseException error) {
        String responseBody = error.getResponseBodyAsString();
        if (StringUtils.hasText(responseBody)) {
            return fallback + ": " + responseBody;
        }

        return fallback + " with status " + error.getStatusCode().value();
    }

    public record AuthRequest(
            String email,
            String name,
            String rollNo,
            String accessCode,
            String clientId,
            String clientSecret) {
    }

    public record TokenResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("expires_in") long expiresIn) {
    }

    private record AuthResponse(
            @JsonProperty("access_token") @JsonAlias("accessToken") String accessToken,
            @JsonProperty("expires_in") @JsonAlias("expiresIn") long expiresIn) {
    }
}
