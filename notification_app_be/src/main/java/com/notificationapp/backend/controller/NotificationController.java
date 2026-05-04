package com.notificationapp.backend.controller;

import com.notificationapp.backend.service.NotificationProxyService;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController {

    private final NotificationProxyService notificationProxyService;

    public NotificationController(NotificationProxyService notificationProxyService) {
        this.notificationProxyService = notificationProxyService;
    }

    @GetMapping(value = "/api/notifications", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getNotifications(@RequestParam Map<String, String> queryParams) {
        return notificationProxyService.fetchNotifications(queryParams);
    }

    @GetMapping(value = "/api/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public String health() {
        return "{\"status\":\"UP\"}";
    }
}
