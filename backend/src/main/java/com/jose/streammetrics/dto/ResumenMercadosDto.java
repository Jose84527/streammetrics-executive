package com.jose.streammetrics.dto;

import java.util.List;

public record ResumenMercadosDto(
        List<ConsumoMercadoDto> paisesMayorConsumo,
        List<ConsumoMercadoDto> continentesMayorConsumo
) {
}