package com.example.apartment_api.dto;

import com.example.apartment_api.enums.YapilacakStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class YapilacakRequestDto {

    @NotBlank
    private String type;

    @NotBlank
    private String aciklama;

    @NotNull
    private LocalDateTime expiredate;

    @NotNull
    private YapilacakStatus status;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAciklama() { return aciklama; }
    public void setAciklama(String aciklama) { this.aciklama = aciklama; }

    public LocalDateTime getExpiredate() { return expiredate; }
    public void setExpiredate(LocalDateTime expiredate) { this.expiredate = expiredate; }

    public YapilacakStatus getStatus() { return status; }
    public void setStatus(YapilacakStatus status) { this.status = status; }
}
