package com.example.apartment_api.dto;

import jakarta.validation.constraints.NotBlank;

public class UcretTypeRequestDto {

    @NotBlank(message = "code cannot be empty")
    private String code;

    @NotBlank(message = "aciklama cannot be empty")
    private String aciklama;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getAciklama() { return aciklama; }
    public void setAciklama(String aciklama) { this.aciklama = aciklama; }
}
