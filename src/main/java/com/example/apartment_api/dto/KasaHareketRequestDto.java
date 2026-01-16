package com.example.apartment_api.dto;

import com.example.apartment_api.enums.KasaDirection;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public class KasaHareketRequestDto {

    @NotNull
    private UUID kasaid;

    private UUID daireid;

    private UUID ucrettypeid;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private KasaDirection direction;

    private String description;

    public UUID getKasaid() { return kasaid; }
    public void setKasaid(UUID kasaid) { this.kasaid = kasaid; }

    public UUID getDaireid() { return daireid; }
    public void setDaireid(UUID daireid) { this.daireid = daireid; }

    public UUID getUcrettypeid() { return ucrettypeid; }
    public void setUcrettypeid(UUID ucrettypeid) { this.ucrettypeid = ucrettypeid; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public KasaDirection getDirection() { return direction; }
    public void setDirection(KasaDirection direction) { this.direction = direction; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
