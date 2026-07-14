---
title: "Continuous control with deep reinforcement learning"
date: "2025-11-12"
tags: ["Paper Review", "Deep Learning", "Robotics", "Reinforcement Learning"]
author: "Lillicrap et al. (arXiv, 2015)"
rating: "4.5/5"
links: ["synapsedecode", "myohand"]
summary: "Introduces Deep Deterministic Policy Gradient (DDPG), an actor-critic algorithm that solves continuous-action robotics control tasks directly from pixels or raw states."
---

## Overview & Core Question
Standard reinforcement learning algorithms like Q-learning work exceptionally well for discrete action spaces (like Atari games). However, physical robots must operate in continuous action spaces (exact joint torques, precise servo angles). How can we scale deep reinforcement learning to continuous control tasks?

## Methodology
The authors introduce **Deep Deterministic Policy Gradient (DDPG)**, a model-free, off-policy actor-critic algorithm:
- **Actor Network**: Learns a policy $\mu(s|\theta^\mu)$ that maps states directly to continuous actions.
- **Critic Network**: Learns a Q-value function $Q(s, a|\theta^Q)$ that evaluates the selected actions.
- **Key Tricks**: 
  - **Replay Buffer**: Breaks correlation between consecutive samples.
  - **Soft Target Updates**: Copying actor/critic weights to target weights slowly ($\theta' \leftarrow \tau\theta + (1-\tau)\theta'$ with $\tau \ll 1$) to stabilize training.

```
       ┌──────────────────────── s_t ────────────────────────┐
       ▼                                                     ▼
┌────────────── Actor Network ──────────────┐     ┌─────────────────────────────────────────┐
│  Outputs Action a_t = μ(s_t)              │───> │  Critic Network                         │
└───────────────────────────────────────────┘     │  Computes Q(s_t, a_t)                   │
                                                  └─────────────────────────────────────────┘
                                                               ▲
                                                               │
                                                       Target Reward (r_t)
```

## Key Findings
- DDPG solved a wide range of continuous control tasks (from the MuJoCo physics engine), including cartpole swing-ups, bipedal walking, and 3D reaching.
- The algorithm was shown to learn policies directly from raw camera pixels, proving that neural representation learning and continuous control can be optimized end-to-end.

## My Critical Review & Notes
DDPG is a classic, but it is notorious for being extremely sensitive to hyperparameters (learning rate, noise model, target update speed). If the exploration noise (usually modeled as an Ornstein-Uhlenbeck process) is too high, the policy collapses into spinning joints; if too low, it never discovers how to walk.

For my work on **MyoHand**, instead of direct reinforcement learning on-chip, I find that structured linear control (PID) mixed with localized classification yields far more deterministic, safe, and stable grip behaviors. However, DDPG is an interesting candidate for training digital muscle model simulations offline.
