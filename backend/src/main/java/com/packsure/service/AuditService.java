package com.packsure.service;

import com.packsure.model.AuditLog;
import com.packsure.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(Long userId, String username, String action, String entityType, Long entityId, String details, String ipAddress) {
        AuditLog entry = new AuditLog(userId, username, action, entityType, entityId, details, ipAddress);
        auditLogRepository.save(entry);
    }
}
