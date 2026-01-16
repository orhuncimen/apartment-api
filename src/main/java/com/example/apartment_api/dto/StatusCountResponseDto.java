package com.example.apartment_api.dto;

import com.example.apartment_api.enums.YapilacakStatus;

public class StatusCountResponseDto {

    private YapilacakStatus status;
    private long count;

    public StatusCountResponseDto(YapilacakStatus status, long count) {
        this.status = status;
        this.count = count;
    }

    public YapilacakStatus getStatus() { return status; }
    public void setStatus(YapilacakStatus status) { this.status = status; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
