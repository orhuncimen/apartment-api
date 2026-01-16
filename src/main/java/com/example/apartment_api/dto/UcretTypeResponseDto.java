package com.example.apartment_api.dto;

import java.util.UUID;

public class UcretTypeResponseDto {

    private UUID id;
    private String code;
    private String aciklama;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getAciklama() { return aciklama; }
    public void setAciklama(String aciklama) { this.aciklama = aciklama; }
}
