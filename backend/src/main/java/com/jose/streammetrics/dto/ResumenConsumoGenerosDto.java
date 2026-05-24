package com.jose.streammetrics.dto;

import java.util.List;

public record ResumenConsumoGenerosDto(
        List<ConsumoGeneroDto> generosPorVisualizaciones,
        List<ConsumoGeneroDto> generosPorHorasVistas
) {
}