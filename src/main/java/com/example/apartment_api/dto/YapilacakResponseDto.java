package com.example.apartment_api.dto;

import com.example.apartment_api.enums.YapilacakStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class YapilacakResponseDto {

    private UUID id;
    private String type;
    private String aciklama;
    private LocalDateTime expiredate;
    private YapilacakStatus status;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAciklama() { return aciklama; }
    public void setAciklama(String aciklama) { this.aciklama = aciklama; }

    public LocalDateTime getExpiredate() { return expiredate; }
    public void setExpiredate(LocalDateTime expiredate) { this.expiredate = expiredate; }

    public YapilacakStatus getStatus() { return status; }
    public void setStatus(YapilacakStatus status) { this.status = status; }
}
