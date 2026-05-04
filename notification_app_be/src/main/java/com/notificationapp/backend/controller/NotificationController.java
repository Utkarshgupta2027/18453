package com.notificationapp.backend.controller;

import com.notificationapp.backend.service.NotificationAuthService;
import com.notificationapp.backend.service.NotificationProxyService;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController {

    private static final String TOKEN_HEADER = "X-Notification-Token";

    private final NotificationProxyService notificationProxyService;
    private final NotificationAuthService notificationAuthService;

    public NotificationController(
            NotificationProxyService notificationProxyService,
            NotificationAuthService notificationAuthService) {
        this.notificationProxyService = notificationProxyService;
        this.notificationAuthService = notificationAuthService;
    }

    @GetMapping(value = "/api/notifications", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getNotifications(
            @RequestParam Map<String, String> queryParams,
            @RequestHeader(value = TOKEN_HEADER, required = false) String tokenOverride) {
        return notificationProxyService.fetchNotifications(queryParams, tokenOverride);
    }

    @PostMapping(
            value = "/api/auth/token",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public NotificationAuthService.TokenResponse generateToken(
            @RequestBody NotificationAuthService.AuthRequest request) {
        return notificationAuthService.generateAccessToken(request);
    }

    @GetMapping(value = "/api/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public String health() {
        return "{\"status\":\"UP\"}";
    }
}
