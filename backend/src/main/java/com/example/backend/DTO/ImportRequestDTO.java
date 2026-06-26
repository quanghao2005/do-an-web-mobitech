package com.example.backend.DTO;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ImportRequestDTO {
    private Long productId;
    private Integer quantity;
    private BigDecimal importPrice;
}