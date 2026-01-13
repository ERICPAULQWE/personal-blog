---
title: "傅里叶变换视觉实验室"
date: "2026-01-13"
description: "集成谐波合成器、音频引擎与实时频谱分析的全能 DSP 实验平台。"
tags: ["React", "工具", "仿真"]
---

> "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration." —— Nikola Tesla

### 1. 实验简介
本实验是 **傅里叶变换 (Fourier Transform)** 的直观可视化工具。通过手动调节不同频率的谐波分量，你可以亲眼见证复杂的波形是如何从简单的正弦波中“生长”出来的，并实时观察低通滤波器对信号频谱的切割过程。

---

### 2. 核心数学原理
在数字信号处理中，**离散傅里叶变换 (DFT)** 是连接时域与频域的桥梁。其公式如下：

$$
X(k) = \sum_{n=0}^{N-1} x(n) e^{-j \frac{2\pi}{N} kn}
$$

本实验通过 $N=512$ 的采样窗口，将你合成的时域信号 $x(n)$ 转换为频域幅度谱 $X(k)$。

[Image of square wave fourier series]

---

### 3. 功能指南

#### 🎹 谐波合成器 (Synthesizer)
* **f1 (基波)**：决定了音调的核心频率。
* **f2 - f8 (高次谐波)**：调节这些滑块可以改变波形的“音色”。
* **提示**：尝试将 $f_1=1, f_3=0.33, f_5=0.2, f_7=0.14$（奇次谐波衰减），你会观察到波形逐渐趋近于**方波**。

#### 🎸 实时音频反馈
* 点击 **LISTEN** 按钮，Web Audio API 会根据你设计的波形生成周期波 (PeriodicWave)。
* **注意**：建议佩戴耳机以获得更清晰的谐波听感。

#### 🛡️ 滤波器与噪声 (DSP Filter)
* **Noise Floor**：引入高斯白噪声。观察频谱图，你会发现噪声在整个频段内均匀分布。
* **LPF Cutoff**：理想低通滤波器。通过“数学切割”抹除高频成分，观察时域波形如何变得平滑。

---

### 4. 开发规范说明 (Dev Notes)
根据项目《lab提交规范》：
* **模式**：全屏模式 (`fullScreen: true`)，确保双画布渲染性能。
* **组件**：采用 `use client` 指令，完全运行于浏览器端。
* **安全**：禁止引入 `fs` 或其他 `server-only` 模块。

---

### 5. 自检清单
- [x] 顶部包含 `"use client";`
- [x] 根节点 `w-full h-full` 占满舞台
- [x] 导出方式为 `export default`
