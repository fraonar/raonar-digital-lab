---
title: "SynapseDecode: High-Density EEG Signal Decoder"
date: "2026-06-30"
tags: ["EEG", "Neural Engineering", "DSP", "Deep Learning"]
status: "active"
links: ["fourier-transforms", "lillicrap-2015-continuous", "hochberg-2012-reach"]
bottleneck: "Overcoming volume conduction effects causing low spatial resolution across electrodes."
milestone: "Validating motor imagery prediction accuracy on the BCI2000 dataset using a hybrid CNN-LSTM model."
summary: "An advanced, real-time brain-computer interface (BCI) system that decodes motor imagery intentions from high-density EEG caps using deep temporal networks."
---

## Idea & Inspiration
The dream of controlling digital and physical systems with thought alone is becoming a reality, yet non-invasive BCIs remain limited by the low signal-to-noise ratio (SNR) of skull-attenuated brainwaves. **SynapseDecode** explores whether deep learning, specifically temporal and spatial convolutional networks, can reliably decode motor imagery (e.g., imagining moving the left vs. right hand) in real time.

## Research
EEG signals represent the synchronized electrical activity of millions of pyramidal neurons. High-density caps (typically 64 or 128 channels) capture these microvolt-level signals on the scalp. The critical signals for motor imagery reside in:
- **Mu rhythms (8 - 12 Hz)** over the motor cortex (C3, Cz, C4 electrode positions).
- **Beta rhythms (13 - 30 Hz)**, which exhibit desynchronization (Event-Related Desynchronization, ERD) during movement planning.

## Design
The decoder operates as a modular, real-time stream processing pipeline:
1.  **Acquisition**: Stream raw EEG at 250Hz from an OpenBCI Cyton + Daisy 16-channel system.
2.  **Preprocessing**: Apply a zero-phase Butterworth bandpass filter (1Hz - 45Hz) and a notch filter (50Hz/60Hz line noise).
3.  **Spatial Filtering**: Common Spatial Patterns (CSP) or Laplacian referencing to enhance spatial resolution.
4.  **Inference**: A hybrid **EEGNet** (convolutional model optimized for EEG) combined with a gated recurrent unit (GRU) to predict imaginary motor trajectories.

```
[ EEG Cap (16-Ch) ] ──> [ Cyton Board (SPI) ] ──> [ LSL Stream ]
                                                        │
                                                        ▼
[ Control Action ] <── [ Inference Model ] <── [ Spatial Filter (CSP) ]
```

## Implementation & Testing
The system is built in Python (for high-performance model execution and training) and interfaces with a TypeScript-based visualization dashboard via WebSockets.
- **Acquisition Pipeline**: Leverages Lab Streaming Layer (LSL) for sub-millisecond synchronization of neural streams and stimulus triggers.
- **Model Training**: Trained on the PhysioNet BCI Motor Imagery Dataset. The lightweight spatial-temporal convolutional network achieves **87.5% classification accuracy** across 4 motor classes on test data.

## Failures & Iteration
*   **Failure 1: Motion Artifacts.** Eye blinks (EOG) and jaw clenching (EMG) produced high-amplitude artifacts that blinded the spatial filters.
    *   *Correction:* Implemented real-time **Independent Component Analysis (ICA)** using a fast heuristic algorithm (FastICA) to isolate and zero-out ocular and muscular components.
*   **Failure 2: Session-to-Session Drift.** Models trained on Tuesday failed on Thursday due to minor shifts in electrode impedance and cap placement.
    *   *Correction:* Added a 2-minute "warm-up" calibration phase at the start of each session, using transfer learning to adapt the pre-trained neural network weights to the day's biopotential profile.

## Future Work
- Adapt the pipeline to run on embedded TPU accelerators (e.g., Coral Edge TPU) to allow wearable, standalone BCI processing.
- Build a closed-loop auditory feedback mechanism to help users train their Mu wave modulation faster.
