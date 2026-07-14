---
title: "First Closed-Loop Grasp with MyoHand Prototype"
date: "2026-06-28"
tags: ["Robotics", "EMG", "Testing"]
links: ["myohand", "spi-dma-acquisition"]
summary: "Successfully demonstrated a closed-loop 'power grasp' triggered by real-time forearm EMG contractions. Verified motor torque responses."
---

A major milestone reached! After three weeks of debugging firmware and mechanical linkages, the **MyoHand** performed its first successful, intent-driven physical grasp today.

### The Experiment
I wore the electrode cuff on my right forearm and calibrated the 4-channel sEMG array.
- Positioned a standard 330ml soda can on the test bench.
- Contracted my *Flexor Digitorum Superficialis* muscle to initiate the grasp.
- The STM32 classifier predicted a `Power Grasp` with **98.1% confidence** within 40ms.

### Results
The micro-servos pulled the tendon cables smoothly. The hand closed, matching the contours of the can perfectly. To prevent servo stall and structural damage, the firmware monitored current draw on the servo lines.

When the aggregate motor current spiked past **1.8A**, the control loop automatically transitioned from *closing phase* to *holding phase*, capping the PWM duty cycles to maintain grip without crushing the cup or overheating the motors.

### Observed Bottlenecks
While successful, the thumb axis needs a higher gear ratio. Currently, it slips slightly when holding heavier cylindrical objects (>500g). I need to redesign the thumb carriage to use a worm-gear drive rather than a direct-pull linkage.
