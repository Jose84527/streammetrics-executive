package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenMercadosDto;
import com.jose.streammetrics.repository.MercadoRepository;

@Service
public class MercadoService {

    private final MercadoRepository mercadoRepository;

    public MercadoService(MercadoRepository mercadoRepository) {
        this.mercadoRepository = mercadoRepository;
    }

    @Cacheable(
            value = "mercadosConsumo",
            key = "{#filtros.anio(), #filtros.continente(), #filtros.plan(), #filtros.tipoContenido(), #filtros.genero()}"
    )
    public ResumenMercadosDto obtenerResumenMercados(FiltroKpiRequest filtros) {
        return new ResumenMercadosDto(
                mercadoRepository.obtenerTopPaisesPorConsumo(filtros),
                mercadoRepository.obtenerTopContinentesPorConsumo(filtros)
        );
    }
}