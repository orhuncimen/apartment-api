package com.example.apartment_api.dto;

import java.util.UUID;

public class AppUserResponseDto {

    private UUID id;
    private String username;

    private UUID customerId;
    private UUID roleId;

    // İstersen roleCode / roleAciklama da döndürebiliriz, şimdilik sade

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public UUID getRoleId() { return roleId; }
    public void setRoleId(UUID roleId) { this.roleId = roleId; }
}
