package com.example.apartment_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "daireler")
public class Daire {

    @Id
    @GeneratedValue
    private UUID id;

    private LocalDateTime createdate;
    private LocalDateTime updatedate;
    private LocalDateTime enddate;

    @Column(name = "delete")
    private Boolean deleted = false;

    @Column(unique = true)
    private String daireno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid")
    private AppUser user;

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

    public String getDaireno() { return daireno; }
    public void setDaireno(String daireno) { this.daireno = daireno; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
}
