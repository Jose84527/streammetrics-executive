package com.jose.streammetrics.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ResumenReporteEjecutivoDto(
        String titulo,
        LocalDateTime fechaGeneracion,
        ResumenDashboardDto resumenGeneral,
        List<ItemEjecutivoDto> hallazgosPrincipales,
        List<ItemEjecutivoDto> debilidadesDetectadas,
        List<ItemEjecutivoDto> recomendaciones
) {
}