package com.example.apartment_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "duyurular")
public class Duyuru {

    @Id
    @GeneratedValue
    private UUID id;

    private LocalDateTime createdate;
    private LocalDateTime updatedate;
    private LocalDateTime enddate;

    @Column(name = "delete")
    private Boolean deleted = false;

    private String type;
    private String aciklama;
    private LocalDateTime expiredate;

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

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAciklama() { return aciklama; }
    public void setAciklama(String aciklama) { this.aciklama = aciklama; }

    public LocalDateTime getExpiredate() { return expiredate; }
    public void setExpiredate(LocalDateTime expiredate) { this.expiredate = expiredate; }
}
