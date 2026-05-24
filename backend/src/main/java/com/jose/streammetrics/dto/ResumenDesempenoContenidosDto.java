package com.jose.streammetrics.dto;

import java.util.List;

public record ResumenDesempenoContenidosDto(
        List<DesempenoContenidoDto> contenidosMasVistos,
        List<DesempenoContenidoDto> contenidosMejorCalificados,
        List<DesempenoContenidoDto> contenidosMayorFinalizacion
) {
}