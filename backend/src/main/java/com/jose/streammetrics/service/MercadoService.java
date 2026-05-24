package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ResumenMercadosDto;
import com.jose.streammetrics.repository.MercadoRepository;

@Service
public class MercadoService {

    private final MercadoRepository mercadoRepository;

    public MercadoService(MercadoRepository mercadoRepository) {
        this.mercadoRepository = mercadoRepository;
    }

    @Cacheable("mercadosConsumo")
    public ResumenMercadosDto obtenerResumenMercados() {
        return new ResumenMercadosDto(
                mercadoRepository.obtenerTopPaisesPorConsumo(),
                mercadoRepository.obtenerTopContinentesPorConsumo()
        );
    }
}