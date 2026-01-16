package com.example.apartment_api.dto;

import java.util.UUID;

public class DaireResponseDto {

    private UUID id;
    private UUID userid;
    private String daireno;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserid() { return userid; }
    public void setUserid(UUID userid) { this.userid = userid; }

    public String getDaireno() { return daireno; }
    public void setDaireno(String daireno) { this.daireno = daireno; }
}
