package com.example.apartment_api.repository;

import com.example.apartment_api.entity.KasaHareket;
import com.example.apartment_api.enums.KasaDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.apartment_api.enums.KasaDirection;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface KasaHareketRepository extends JpaRepository<KasaHareket, UUID> {

    List<KasaHareket> findByDeletedFalse();

    List<KasaHareket> findByKasaidAndDeletedFalse(UUID kasaid);

    List<KasaHareket> findByKasaidAndDirectionAndDeletedFalse(UUID kasaid, KasaDirection direction);

    @Query("""
        select coalesce(sum(h.amount), 0)
        from KasaHareket h
        where h.kasaid = :kasaid
          and h.deleted = false
          and h.direction = 'IN'
    """)
    BigDecimal sumIn(@Param("kasaid") UUID kasaid);

    @Query("""
        select coalesce(sum(h.amount), 0)
        from KasaHareket h
        where h.kasaid = :kasaid
          and h.deleted = false
          and h.direction = 'OUT'
    """)
    BigDecimal sumOut(@Param("kasaid") UUID kasaid);

    @Query("""
    select count(h)
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
    """)
    long countActiveByKasa(@Param("kasaid") UUID kasaid);

    long countByKasaidAndDeletedFalseAndDirection(UUID kasaid, KasaDirection direction);

    @Query("""
    select max(h.createdate)
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
""")
    LocalDateTime findLastTransactionDate(@Param("kasaid") UUID kasaid);

    @Query("""
    select coalesce(sum(h.amount), 0)
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
      and h.direction = com.example.apartment_api.enums.KasaDirection.IN
      and h.createdate >= :start
      and h.createdate < :end
""")
    BigDecimal sumInBetween(@Param("kasaid") UUID kasaid,
                            @Param("start") LocalDateTime start,
                            @Param("end") LocalDateTime end);

    @Query("""
    select coalesce(sum(h.amount), 0)
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
      and h.direction = com.example.apartment_api.enums.KasaDirection.OUT
      and h.createdate >= :start
      and h.createdate < :end
""")
    BigDecimal sumOutBetween(@Param("kasaid") UUID kasaid,
                             @Param("start") LocalDateTime start,
                             @Param("end") LocalDateTime end);

    @Query("""
    select count(h)
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
      and h.createdate >= :start
      and h.createdate < :end
""")
    long countBetween(@Param("kasaid") UUID kasaid,
                      @Param("start") LocalDateTime start,
                      @Param("end") LocalDateTime end);

    @Query("""
    select count(h)
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
      and h.direction = com.example.apartment_api.enums.KasaDirection.IN
      and h.createdate >= :start
      and h.createdate < :end
""")
    long countInBetween(@Param("kasaid") UUID kasaid,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

    @Query("""
    select count(h)
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
      and h.direction = com.example.apartment_api.enums.KasaDirection.OUT
      and h.createdate >= :start
      and h.createdate < :end
""")
    long countOutBetween(@Param("kasaid") UUID kasaid,
                         @Param("start") LocalDateTime start,
                         @Param("end") LocalDateTime end);

    @Query("""
    select cast(h.createdate as date) as day,
           coalesce(sum(h.amount), 0) as total
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
      and h.direction = com.example.apartment_api.enums.KasaDirection.IN
      and h.createdate >= :start
      and h.createdate < :end
    group by cast(h.createdate as date)
    order by cast(h.createdate as date)
""")
    List<DailySumView> dailyIn(@Param("kasaid") UUID kasaid,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);

    @Query("""
    select cast(h.createdate as date) as day,
           coalesce(sum(h.amount), 0) as total
    from KasaHareket h
    where h.kasaid = :kasaid
      and h.deleted = false
      and h.direction = com.example.apartment_api.enums.KasaDirection.OUT
      and h.createdate >= :start
      and h.createdate < :end
    group by cast(h.createdate as date)
    order by cast(h.createdate as date)
""")
    List<DailySumView> dailyOut(@Param("kasaid") UUID kasaid,
                                @Param("start") LocalDateTime start,
                                @Param("end") LocalDateTime end);
}
