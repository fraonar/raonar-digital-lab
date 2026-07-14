---
title: "Resolving 50Hz Hum in High-Density EEG Cap"
date: "2026-07-05"
tags: ["EEG", "DSP", "Debugging"]
links: ["synapsedecode", "fourier-transforms"]
summary: "Isolated a severe 50Hz mains frequency hum in the EEG signal chain to a faulty reference electrode solder joint. Implemented a spatial averaging filter."
---

Today's session was dedicated to identifying why the central channels (Cz, C3, C4) in my custom EEG cap were completely saturated by a **50Hz sinusoidal oscillation** (line noise from the lab's overhead lighting).

### Diagnostic Steps
1.  **Impedance Check**: Ran an impedance measurement cycle using the Cyton board. Most channels read < 8 kΩ, which is acceptable for active dry electrodes. However, the **REF (Reference)** electrode registered > 150 kΩ!
2.  **Solder Inspection**: Under the microscope, I found a microscopic hairline fracture in the solder joint connecting the reference Ag/AgCl electrode cup to the coaxial shielding wire. The broken connection was acting as an antenna, picking up parasitic AC fields.

### The Fix
- Recut, stripped, and resoldered the REF terminal using lead-free silver solder, then sealed the junction with liquid electrical tape to prevent sweat oxidation. Impedance dropped back to **4.2 kΩ**.
- In the software acquisition loop, I added a real-time **Common Average Reference (CAR)** filter:

$$ V_i^{CAR} = V_i - \frac{1}{N}\sum_{j=1}^N V_j $$

By subtracting the average potential across all channels, common-mode line noise was suppressed by another **28 dB**, revealing clean, rhythmic Alpha waves when the subject's eyes were closed.
