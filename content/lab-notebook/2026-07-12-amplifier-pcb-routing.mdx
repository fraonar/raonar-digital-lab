---
title: "Amplifier PCB Routing and SPI Timing Fixed"
date: "2026-07-12"
tags: ["PCB", "STM32", "SPI", "Hardware"]
links: ["myohand", "spi-dma-acquisition"]
summary: "Successfully routed the front-end amplifier stage of MyoHand PCB v2. Fixed a critical clock skew bug in the SPI DMA interface."
---

Spent 8 hours in the lab today completing the routing for the **MyoHand Analog Front-End (AFE) board**. 

### Analog Guarding & Grounding
Biopotential signals are in the microvolt range, making them extremely susceptible to digital noise coupling. To counter this, I implemented a strict ground-splitting layout:
- **AGND (Analog Ground)** and **DGND (Digital Ground)** are isolated except for a single star connection under the ADS1292 ADC.
- Wrapped the high-impedance differential inputs with a **guard ring** tied to the common-mode output (RLD - Right Leg Drive) to minimize leakage currents.

```
       [ Guard Ring (Tied to RLD) ]
        ┌────────────────────────┐
IN1N ──>│  █ █ █ █ █ █ █ █ █ █   │──> ADS1292 Pin 1
IN1P ──>│  █ █ █ █ █ █ █ █ █ █   │──> ADS1292 Pin 2
        └────────────────────────┘
```

### SPI DMA Skew Fix
When testing the high-speed SPI transfer of 24-bit samples from the ADS1292 to the STM32F411, I observed random bit flips at 8MHz clock rates. 

Capturing the lines with the logic analyzer revealed **clock skew**: the data line (MISO) was transitioning too close to the rising edge of the SPI clock (SCK), violating the setup time of the microcontroller's SPI receiver.

```
SCK  : __|¯¯|__|¯¯|__|¯¯|__
MISO : _XX_XXXX_XXXX_XXXX__  (Transitioning too close to edge!)
```

*Fix:* Reconfigured the STM32 SPI peripheral to sample on the **falling edge** (CPOL=0, CPHA=1), which shifted the sampling point by half a clock cycle. This gave the MISO line a comfortable 62.5ns setup margin. Bit flips are now completely resolved over 12 hours of continuous stress-testing.
