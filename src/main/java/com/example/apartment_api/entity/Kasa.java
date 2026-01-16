package com.example.apartment_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "kasa")
public class Kasa {

    @Id
    @GeneratedValue
    private UUID id;

    private LocalDateTime createdate;
    private LocalDateTime updatedate;
    private LocalDateTime enddate;

    @Column(name = "delete")
    private Boolean deleted = false;

    @Column(unique = true)
    private Integer years;

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

    public Integer getYears() { return years; }
    public void setYears(Integer years) { this.years = years; }
}
