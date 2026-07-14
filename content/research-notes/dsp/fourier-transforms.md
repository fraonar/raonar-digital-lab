---
title: "Fourier Analysis and Spectral Estimation for Neural Signals"
date: "2026-06-20"
tags: ["DSP", "Math", "EEG", "Fourier"]
topic: "DSP"
links: ["synapsedecode", "2026-07-05-eeg-channel-noise"]
summary: "An overview of discrete Fourier transforms, power spectral density (PSD) estimation using Welch's method, and the math behind short-time Fourier transforms."
---

In neural signal processing, time-domain voltages are often highly chaotic. Moving to the frequency domain allows us to dissect underlying brain oscillations (Delta, Theta, Alpha, Beta, Gamma) and understand neural synchrony.

### The Discrete Fourier Transform (DFT)
For a sampled biopotential sequence $x[n]$ of length $N$, the DFT is defined as:

$$ X[k] = \sum_{n=0}^{N-1} x[n] e^{-j \frac{2\pi}{N} kn} $$

While the Fast Fourier Transform (FFT) reduces computational complexity from $O(N^2)$ to $O(N \log N)$, applying a raw FFT directly to non-stationary EEG data is dangerous. It assumes infinite stationarity and suffers from **spectral leakage** due to finite window clipping.

### Windowing functions
To reduce spectral leakage, we must multiply the signal window by a tapering window $w[n]$ (e.g., Hamming or Hann) before computing the FFT:

- **Hamming Window**: Optimized to suppress the first sidelobe.
- **Hann Window**: Smoother rolloff, reducing leakage further out.

### Welch's Method for PSD Estimation
Welch's method improves on the raw periodogram by splitting the signal into overlapping segments, calculating the periodogram for each segment, and averaging them. This reduces the variance of the spectral estimate at the cost of frequency resolution.

```
Raw Signal:   [======== Segment 1 ========]
                       [======== Segment 2 ========]
                                  [======== Segment 3 ========]
                       (Compute FFT & Average -> Clean PSD)
```

For a signal segment $x_i[n]$, the windowed periodogram is:

$$ P_i(f) = \frac{1}{M U} \left| \sum_{n=0}^{M-1} x_i[n] w[n] e^{-j 2 \pi f n} \right|^2 $$

Where $U$ is a normalization factor for the window energy. The final Welch estimate is the average across all segments:

$$ \hat{P}_{Welch}(f) = \frac{1}{K} \sum_{i=1}^K P_i(f) $$

This averaged representation is crucial when training machine learning classifiers to recognize motor imagery states in the **SynapseDecode** project.
