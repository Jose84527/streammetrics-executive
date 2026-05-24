package com.jose.streammetrics.dto;

import java.math.BigDecimal;

public record CumplimientoMetaDto(
        String pais,
        Long visualizacionesReales,
        Long metaVisualizaciones,
        BigDecimal porcentajeCumplimientoVisualizaciones,
        BigDecimal horasReales,
        BigDecimal metaHoras,
        BigDecimal porcentajeCumplimientoHoras,
        String estado
) {
}