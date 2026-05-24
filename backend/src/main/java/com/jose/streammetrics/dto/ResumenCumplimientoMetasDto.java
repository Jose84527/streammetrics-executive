package com.jose.streammetrics.dto;

import java.util.List;

public record ResumenCumplimientoMetasDto(
        List<CumplimientoMetaDto> cumplimientoPorPais
) {
}