package com.example.apartment_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class DuyuruRequestDto {

    @NotBlank
    private String type;

    @NotBlank
    private String aciklama;

    @NotNull
    private LocalDateTime expiredate;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAciklama() { return aciklama; }
    public void setAciklama(String aciklama) { this.aciklama = aciklama; }

    public LocalDateTime getExpiredate() { return expiredate; }
    public void setExpiredate(LocalDateTime expiredate) { this.expiredate = expiredate; }
}
