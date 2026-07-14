---
title: "MyoHand: A Low-Cost EMG-Controlled Prosthetic Hand"
date: "2026-07-12"
tags: ["EMG", "Biomedical Signal Processing", "Embedded Systems", "Robotics"]
status: "active"
links: ["spi-dma-acquisition", "fourier-transforms", "hochberg-2012-reach"]
bottleneck: "Fine-tuning signal processing cascade to filter out forearm muscle crosstalk during pinch grips."
milestone: "Designing PCB v2.0 for integrated battery management and Bluetooth telemetry."
summary: "An open-source, affordable prosthetic hand utilizing multi-channel EMG sensors, local pattern recognition on STM32, and high-torque micro-servos."
---

## Idea & Inspiration
Amputees worldwide face extreme financial barriers when seeking functional myoelectric prostheses, which often cost upwards of $20,000. **MyoHand** aims to democratize access to advanced prosthetics by leveraging low-cost 3D printing, consumer-grade STM32 microcontrollers, and localized machine learning algorithms.

## Research
Before writing any code, I analyzed forearm anatomy to identify optimal surface EMG (sEMG) sensor placements. The key target muscles are:
- **Flexor Digitorum Superficialis** (for flexion/closing grasps)
- **Extensor Digitorum** (for extension/opening grasps)
- **Pronator Teres** (for rotational assist)

We require a dry electrode setup with active filtering (bandpass 20Hz - 500Hz) to capture raw muscle action potentials.

## Design
The mechanical system consists of a 5-digit SLA-printed hand. Flexion is driven by high-torque coreless micro-servos mounted in the forearm chassis, pulling braided Dyneema cords acting as tendons. Extension is assisted by internal spring-steel joints.

The electrical system revolves around:
- **STM32F411CEU6 "Black Pill"**: Running at 100MHz to handle analog sampling and feature extraction.
- **ADS1292**: A 2-channel, 24-bit delta-sigma ADC specialized for biopotential measurements.

```
[ sEMG Electrodes ] ──> [ ADS1292 (Analog Front End) ] ──> [ STM32F411 (SPI) ]
                                                                 │
                                                                 ▼
[ Multi-Servo Output ] <── [ High-Torque Servos ] <── [ PWM Control Driver ]
```

## Implementation & Testing
I implemented a rolling buffer architecture to process sEMG signals in 128ms overlapping windows. For each window, the STM32 calculates several Time-Domain (TD) features:
1. **Mean Absolute Value (MAV)**
2. **Slope Sign Changes (SSC)**
3. **Zero Crossings (ZC)**
4. **Waveform Length (WL)**

These features are fed into a lightweight Linear Discriminant Analysis (LDA) classifier running directly on-chip.

During initial trials, the classifier achieved **92.4% accuracy** across four distinct grasp types: power grasp, pinch grasp, tripod grasp, and rest.

## Failures & Iteration
*   **Failure 1: High Latency.** Initially, processing took over 200ms, creating a noticeable delay between muscle contraction and hand movement. 
    *   *Correction:* Refactored ADC acquisition to use **SPI DMA circular buffers** to offload the CPU, bringing total control loop latency under **45ms**.
*   **Failure 2: Motor Noise.** Servo motor current draw caused severe voltage sag, injecting noise directly into the biopotential ADC lines.
    *   *Correction:* Isolated the analog rail using a dedicated ultra-low-noise LDO and placed separate grounds for power (servos) and analog components.

## Future Work
- Integrate a flexible **force-sensing resistor (FSR)** array into the fingertips to enable closed-loop tactile feedback (haptic vibration on the residual limb).
- Expand the LDA classifier to a Spiking Neural Network (SNN) utilizing the STM32's hardware DSP instructions.
