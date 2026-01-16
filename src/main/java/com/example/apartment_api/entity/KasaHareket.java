package com.example.apartment_api.entity;

import com.example.apartment_api.enums.KasaDirection;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "kasa_hareket")
public class KasaHareket {

    @Id
    @GeneratedValue
    private UUID id;

    private LocalDateTime createdate;
    private LocalDateTime updatedate;
    private LocalDateTime enddate;

    @Column(name = "delete")
    private Boolean deleted = false;

    @Column(nullable = false)
    private UUID kasaid;

    private UUID daireid;

    private UUID ucrettypeid;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KasaDirection direction;

    private String description;

    // getter & setter
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LocalDateTime getCreatedate() { return createdate; }
    public void setCreatedate(LocalDateTime createdate) { this.createdate = createdate; }

    public LocalDateTime getUpdatedate() { return updatedate; }
    public void setUpdatedate(LocalDateTime updatedate) { this.updatedate = updatedate; }

    public LocalDateTime getEnddate() { return enddate; }
    public void setEnddate(LocalDateTime enddate) { this.enddate = enddate; }

    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }

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
