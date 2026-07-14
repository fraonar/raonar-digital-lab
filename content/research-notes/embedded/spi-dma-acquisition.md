---
title: "Direct Memory Access (DMA) and SPI Acquisition on ARM"
date: "2026-06-15"
tags: ["Embedded", "STM32", "SPI", "DMA"]
topic: "Embedded"
links: ["myohand", "optobrain", "2026-07-12-amplifier-pcb-routing"]
summary: "Technical notes on configuring SPI peripherals with circular DMA buffers to achieve zero-overhead, sub-millisecond biosignal acquisition."
---

When sampling analog biopotentials at high frequencies (e.g., 8 channels at 2kHz), the CPU can quickly become bottlenecked by handling interrupts for every single incoming byte. On ARM Cortex-M architecture, **Direct Memory Access (DMA)** allows peripherals to write directly to RAM without CPU intervention.

### Non-DMA vs. DMA Acquisition Cost
- **Polling (No Interrupts)**: CPU sits in a tight loop waiting for the SPI `RXNE` (Receive Not Empty) flag. **CPU utilization: 99%**.
- **Interrupt Per Byte (No DMA)**: An Interrupt Service Routine (ISR) is triggered for every received byte. Register pushing/popping overhead causes severe jitter at high sampling rates.
- **DMA Circular Buffer**: SPI transfers bytes directly to a dual-buffer in RAM. An interrupt is triggered ONLY when half the buffer (`Half-Transfer`) or the full buffer (`Transfer-Complete`) is filled. **CPU utilization: < 2%**.

### Circular Buffer Architecture
By using a circular buffer divided into two halves (Ping-Pong buffer), the STM32 can sample incoming ADC bytes into the "Ping" half while the CPU processes data in the "Pong" half.

```
       ┌─────────────────────────── Circular Buffer ┌───────────────────────────┐
       ▼                                                                        ▼
┌────────────── Ping Buffer ──────────────┬────────────── Pong Buffer ──────────────┐
│  ADC Data (Being Written by DMA)        │  Processed Data (Being Read by CPU)     │
└─────────────────────────────────────────┴─────────────────────────────────────────┘
 ▲                                         ▲
 │                                         │
DMA Write Head                            CPU Read Head
```

### Hal Register Configuration Snippet (STM32)
To configure the SPI peripheral with DMA in circular mode, the DMA stream must be initialized with circular addressing:

```c
/* SPI1 DMA Init */
hdma_spi1_rx.Instance = DMA2_Stream0;
hdma_spi1_rx.Init.Channel = DMA_CHANNEL_3;
hdma_spi1_rx.Init.Direction = DMA_PERIPH_TO_MEMORY;
hdma_spi1_rx.Init.PeriphInc = DMA_PINC_DISABLE;
hdma_spi1_rx.Init.MemInc = DMA_MINC_ENABLE;
hdma_spi1_rx.Init.PeriphDataAlignment = DMA_PDATAALIGN_BYTE;
hdma_spi1_rx.Init.MemDataAlignment = DMA_MDATAALIGN_BYTE;
hdma_spi1_rx.Init.Mode = DMA_CIRCULAR;
hdma_spi1_rx.Init.Priority = DMA_PRIORITY_VERY_HIGH;
HAL_DMA_Init(&hdma_spi1_rx);

/* Link DMA to SPI */
__HAL_LINKDMA(hspi, hdmarx, hdma_spi1_rx);
```

Once running, the CPU is notified via the `HAL_SPI_RxHalfCpltCallback()` and `HAL_SPI_RxCpltCallback()` handlers, ensuring perfectly synchronized, jitter-free sampling.
