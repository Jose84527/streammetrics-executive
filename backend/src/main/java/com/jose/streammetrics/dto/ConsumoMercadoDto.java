package com.jose.streammetrics.dto;

import java.math.BigDecimal;

public record ConsumoMercadoDto(
        String nombre,
        Long visualizaciones,
        BigDecimal horasVistas
) {
}