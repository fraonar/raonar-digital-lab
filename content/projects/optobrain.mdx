---
title: "OptoBrain: Fiber Photometry Acquisition System"
date: "2026-05-15"
tags: ["Optogenetics", "Biomedical Signal Processing", "FPGA", "Hardware"]
status: "completed"
links: ["spi-dma-acquisition", "fourier-transforms"]
bottleneck: "Achieving high phase-locked loop synchronization accuracy on sub-microvolt optical signals."
milestone: "Published mechanical layout and firmware on Open-Science framework."
summary: "A low-noise, dual-wavelength fiber photometry system for real-time monitoring of calcium fluorescence (GCaMP) and neurotransmitter sensors in deep brain structures."
---

## Idea & Inspiration
Fiber photometry allows researchers to record bulk calcium dynamics from specific cell populations in behaving animals. Commercial setups cost upwards of $30,000 and are highly closed-source. **OptoBrain** is an open-source, dual-excitation optical recording system built for under $1,200.

## Research
The system uses dual light-emitting diodes (LEDs) to excite fluorescent biosensors (such as GCaMP6s):
- **470 nm Excitation**: Excites calcium-dependent fluorescence (signal channel).
- **405 nm Excitation**: Excites calcium-independent isosbestic fluorescence (refers to background autofluorescence and motion artifacts).

By modulating both light sources at distinct carrier frequencies (e.g., 211Hz and 531Hz) and using lock-in amplification, we can extract the true calcium signal from extreme optical noise.

## Design
- **Analog Path**: Dual photodetectors drive a low-noise transimpedance amplifier (TIA) with high dynamic range.
- **Digital Path**: An RP2040 microcontroller manages excitation modulation and samples the photodiode voltages using an external 16-bit ADC (ADS8681).

## Implementation & Testing
The lock-in amplification algorithm is implemented on-chip. Demodulation separates the 470nm (signal) and 405nm (isosbestic) responses perfectly. 
Testing in a brain phantom showed a **noise floor of <2 uV RMS**, matching the signal quality of premium commercial systems.

## Failures & Iteration
*   **Failure:** Fiber-bending artifact was initially indistinguishable from neurotransmitter release.
    *   *Correction:* Refined the ratiometric calculation (`ΔF/F`) where the isosbestic 405nm signal is scaled and subtracted from the 470nm signal, successfully canceling out motion and cable-flexing noise.
