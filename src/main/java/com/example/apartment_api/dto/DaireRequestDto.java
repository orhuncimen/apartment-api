package com.example.apartment_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class DaireRequestDto {

    @NotNull(message = "userid cannot be null")
    private UUID userid;

    @NotBlank(message = "daireno cannot be empty")
    private String daireno;

    public UUID getUserid() { return userid; }
    public void setUserid(UUID userid) { this.userid = userid; }

    public String getDaireno() { return daireno; }
    public void setDaireno(String daireno) { this.daireno = daireno; }
}
