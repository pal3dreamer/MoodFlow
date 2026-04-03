---
theme: seriph
background: none
class: text-center
highlighter: shiki
drawings:
 persist: false
transition: slide-left
title: MoodFlow
---

<div class="h-full flex flex-col justify-center items-center py-4 bg-[#F5F5F7] font-sans text-[#1D1D1F] gap-y-8">
<div class="flex flex-col items-center opacity-40">
<div class="flex justify-between w-[380px] mb-2 px-2 text-[#005F73] font-bold">
<div class="text-[10px]  font-bold">Subjective Experience</div>
<div class="text-[10px]  font-bold">Objective Data</div>
</div>
<div class="relative w-[380px] h-px bg-black/10">
<div class="absolute top-1/2 left-0 -translate-y-1/2 flex justify-between w-full px-4">
<div class="w-1 h-1 rounded-full bg-black/20"></div>
<div class="w-1 h-1 rounded-full bg-black/20"></div>
<div class="w-2 h-2 rounded-full bg-[#005F73] shadow-[0_0_10px_rgba(0,95,115,0.3)]"></div>
<div class="w-1 h-1 rounded-full bg-black/20"></div>
<div class="w-1 h-1 rounded-full bg-black/20"></div>
</div>
</div>
<div class="flex justify-between w-[380px] mt-4 text-xl text-black/40">
<carbon:activity />
<carbon:analytics />
<carbon:center-circle class="text-[#005F73] scale-125" />
<carbon:data-refinery />
<carbon:data-base />
</div>
</div>
<div class="flex flex-col items-center">
<h1 class="title-text">MoodFlow</h1>
<div class="h-px w-20 bg-[#005F73] opacity-30 my-4"></div>
<p class="subtitle-text">The Science of Emotional Resonance</p>
</div>
<div class="flex flex-col items-center space-y-4">
<div v-click class="px-8 py-2 bg-white border border-black/[0.05] shadow-sm rounded-full">
<p class="text-xs font-light">
An <span class="font-semibold text-[#005F73]">Emotional Mirror</span> for high-performance productivity.
</p>
</div>
<div v-click class="max-w-xl text-center">
<p class="text-sm font-light text-black/50 italic px-12 leading-relaxed">
Transforming productivity from <span class="opacity-30 line-through">"time-spent"</span> 
into <span class="text-black font-normal not-italic">"quality-of-mind"</span>.
</p>
</div>
</div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap');
.slidev-layout {
background-color: #F5F5F7 !important;
color: #1D1D1F !important;
padding: 0 !important;
}
.title-text {
font-family: 'Inter', sans-serif !important;
font-size: 5rem !important;
font-weight: 700 !important;
letter-spacing: normal !important;
text-transform: ;
margin-left: 0; 
line-height: 1;
color: #1D1D1F;
}
.subtitle-text {
font-family: 'Inter', sans-serif !important;
font-size: 1.25rem !important;
font-weight: 600 !important;
letter-spacing: normal !important;
text-transform: ;
color: rgba(0,0,0,0.5);
margin-left: 0;
}
.v-click-hidden {
opacity: 0;
transform: translateY(15px);
}
</style>

---
layout: none
---

<div class="grid grid-cols-2 h-full bg-[#F5F5F7]">
<div class="flex flex-col justify-start py-10 px-12 space-y-6">
<div class="space-y-2">
<h2 class="text-2xl font-bold font-sans leading-snug text-[#1D1D1F]">We track every metric except the one that matters most: <span class="text-black">Mental State.</span></h2>
</div>
<div class="space-y-5">
<div class="space-y-1.5">
<div class="flex items-center gap-2">
<div class="w-1.5 h-1.5 bg-[#005F73] flex-shrink-0 rounded-full"></div>
<p class="font-bold text-[0.65rem]  text-[#1D1D1F]">1. The Flaw of Timers</p>
</div>
<p class="font-light text-black/60 text-[0.65rem] leading-relaxed pl-[1.1rem]">Pomodoros and time-blockers assume humans are machines. They ignore stress accumulation and cognitive fatigue.</p>
</div>
<div class="space-y-1.5">
<div class="flex items-center gap-2">
<div class="w-1.5 h-1.5 bg-[#005F73] flex-shrink-0 rounded-full"></div>
<p class="font-bold text-[0.65rem]  text-[#1D1D1F]">2. The Friction of Journaling</p>
</div>
<p class="font-light text-black/60 text-[0.65rem] leading-relaxed pl-[1.1rem]">Typing out feelings interrupts the"flow state" and feels like a chore, leading to low adoption.</p>
</div>
<div class="space-y-1.5">
<div class="flex items-center gap-2">
<div class="w-1.5 h-1.5 bg-[#005F73] flex-shrink-0 rounded-full"></div>
<p class="font-bold text-[0.65rem]  text-[#1D1D1F]">3. The Inaccuracy of Text AI</p>
</div>
<p class="font-light text-black/60 text-[0.65rem] leading-relaxed pl-[1.1rem]">Traditional sentiment analysis reads what we say, completely missing how we say it.</p>
</div>
<div class="space-y-1.5">
<div class="flex items-center gap-2">
<div class="w-1.5 h-1.5 bg-[#005F73] flex-shrink-0 rounded-full"></div>
<p class="font-bold text-[0.65rem]  text-[#1D1D1F]">4. No Task-Emotion Correlation</p>
</div>
<p class="font-light text-black/60 text-[0.65rem] leading-relaxed pl-[1.1rem]">We lack the data to objectively identify which specific tasks are causing silent stress spikes.</p>
</div>
</div>
</div>
<div class="relative h-full flex items-center justify-center p-6">
<img src="/slide2.png" class="max-h-full max-w-full object-contain" />
<div class="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F5F5F7] to-transparent w-24"></div>
</div>
</div>

---
layout: none
---

<div class="h-full flex flex-col justify-between bg-[#F5F5F7] px-12 py-10 text-[#1D1D1F]">
<div class="space-y-1 mb-4">
<h2 class="text-3xl font-sans font-bold text-[#1D1D1F]">Listening to Stress, Not Just Words</h2>
<p class="text-[0.7rem] font-light text-black/60">We didn't just wrap an LLM. We built a custom, continuous acoustic processing pipeline.</p>
</div>

<!-- Architecture Diagram (HTML/CSS) -->
<div class="relative w-full bg-white border border-black/[0.05] rounded-xl p-6 flex flex-col items-center justify-center shadow-sm mb-6 mt-2 overflow-hidden z-0">
<div class="flex flex-col w-full relative">
<!-- Top Row: Acoustic -->
<div class="flex items-start justify-between w-full relative z-20">
<div class="flex flex-col items-center gap-1 z-20 w-[4.5rem]">
<div class="w-10 h-10 bg-white border border-[#005F73]/30 rounded-full shadow-[0_4px_10px_rgba(0,95,115,0.1)] flex items-center justify-center text-[#005F73] relative z-20">
<carbon:microphone />
</div>
<span class="text-[0.45rem] font-mono text-black/60  mt-1 text-center bg-white px-1 relative z-20">Audio Tensor</span>
</div>
<carbon:arrow-right class="text-[#005F73]/40 mt-4" />
<div class="flex flex-col items-center gap-1 z-20 w-[6rem]">
<div class="w-full h-10 bg-[#f0f8f7] border border-[#005F73]/30 rounded shadow-sm flex items-center justify-center text-[0.6rem] font-bold text-[#005F73]">Wav2Vec2</div>
<span class="text-[0.4rem] font-mono text-black/40  mt-1 text-center">Feature Extraction</span>
</div>
<carbon:arrow-right class="text-[#005F73]/40 mt-4" />
<div class="flex flex-col items-center gap-1 z-20 w-[6rem]">
<div class="w-full h-10 bg-[#f0f8f7] border border-[#005F73]/30 rounded shadow-sm flex items-center justify-center text-[0.6rem] font-bold text-[#005F73]">VAD Neural Reg.</div>
<span class="text-[0.4rem] font-mono text-black/40  mt-1 text-center">Continuous 3D Space</span>
</div>
<carbon:arrow-right class="text-[#005F73]/40 mt-4" />
<div class="flex flex-col items-center gap-1 z-20 w-[6rem]">
<div class="w-full h-10 bg-[#f0f8f7] border border-[#005F73]/30 rounded shadow-sm flex items-center justify-center text-[0.6rem] font-bold text-[#005F73]">EMA Smoothing</div>
<span class="text-[0.4rem] font-mono text-black/40  mt-1 text-center">Stress Heuristics</span>
</div>
<carbon:arrow-right class="text-[#005F73]/40 mt-4" />
<div class="flex flex-col items-center gap-1 z-20 w-[4.5rem]">
<div class="w-16 h-16 bg-[#005F73] border border-[#005F73] rounded-xl shadow-[0_5px_15px_rgba(0,95,115,0.3)] flex items-center justify-center text-white text-center leading-tight p-2 font-bold text-[0.55rem] relative z-20">Multi-Modal<br/>Output</div>
</div>
</div>
<!-- Bottom Row: Semantic -->
<div class="flex items-center w-full relative z-10 mt-6">
<!-- CONNECTOR: Audio Tensor to Whisper -->
<div class="absolute bottom-[2.25rem] left-[2.25rem] w-[5rem] h-[5rem] border-l border-b border-[#005F73]/30 rounded-bl-lg -z-10"></div>
<div class="flex flex-col items-center gap-1 z-20 w-[6rem] bg-white relative ml-[4.25rem]">
<div class="w-full h-9 bg-white border border-black/10 rounded shadow-sm flex items-center justify-center text-[0.55rem] font-bold text-black/70">Whisper ASR</div>
<span class="text-[0.4rem] font-mono text-black/30  mt-1 text-center bg-white px-1">Speech-to-Text</span>
</div>
<carbon:arrow-right class="text-black/20 mx-[1.5rem] bg-white relative z-20" />
<div class="flex flex-col items-center gap-1 z-20 w-[6rem] bg-white relative">
<div class="w-full h-9 bg-white border border-black/10 rounded shadow-sm flex items-center justify-center text-[0.55rem] font-bold text-black/70">Gemini Topic</div>
<span class="text-[0.4rem] font-mono text-black/30  mt-1 text-center bg-white px-1">Context Sync</span>
</div>
<!-- CONNECTOR: Gemini to Output -->
<div class="absolute bottom-[2.25rem] left-[17rem] right-[2.25rem] h-[5rem] border-r border-b border-[#005F73]/30 rounded-br-lg -z-10">
<!-- Arrowhead pointing up -->
<carbon:arrow-right class="absolute -right-[0.4rem] -top-[0.6rem] -rotate-90 text-[#005F73]/50" />
</div>
</div>
</div>
</div>

<div class="grid grid-cols-2 gap-x-12 gap-y-6 flex-grow items-start px-2">
<div class="space-y-1.5">
<div class="flex items-center gap-2">
<div class="w-5 h-5 rounded bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-[0.6rem]">1</div>
<h4 class="font-bold text-[0.65rem]  text-[#1D1D1F]">Acoustic Feature Extraction</h4>
</div>
<p class="text-[0.6rem] font-light text-black/60 leading-relaxed pl-7">For emotion detection, we bypass text sentiment entirely. We feed 16kHz mono audio tensors directly into our fine-tuned Wav2Vec2 model (<code class="text-[0.5rem] bg-black/5 px-1 rounded text-[#005F73] font-mono">audeering-robust-12-ft-emotion-msp-dim</code>).</p>
</div>
<div class="space-y-1.5">
<div class="flex items-center gap-2">
<div class="w-5 h-5 rounded bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-[0.6rem]">2</div>
<h4 class="font-bold text-[0.65rem]  text-[#1D1D1F]">Dimensional Emotion (VAD)</h4>
</div>
<p class="text-[0.6rem] font-light text-black/60 leading-relaxed pl-7">Instead of basic"happy/sad" classification, we run neural regression to map the voice into a continuous 3D space: Valence (positivity), Arousal (energy), and Dominance (control).</p>
</div>
<div class="space-y-1.5">
<div class="flex items-center gap-2">
<div class="w-5 h-5 rounded bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-[0.6rem]">3</div>
<h4 class="font-bold text-[0.65rem]  text-[#1D1D1F]">Custom Stress Heuristics</h4>
</div>
<p class="text-[0.6rem] font-light text-black/60 leading-relaxed pl-7">Raw acoustic data is noisy. We apply Exponential Moving Average (EMA) temporal smoothing (α = 0.3) to filter micro-fluctuations, then calculate the derivative to mathematically detect acute stress spikes (Δ> 0.3).</p>
</div>
<div class="space-y-1.5">
<div class="flex items-center gap-2">
<div class="w-5 h-5 rounded bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-[0.6rem]">4</div>
<h4 class="font-bold text-[0.65rem]  text-[#1D1D1F]">Multi-Modal Context</h4>
</div>
<p class="text-[0.6rem] font-light text-black/60 leading-relaxed pl-7">In parallel, a local Whisper-base model handles ASR (Speech-to-Text). The transcript is fed to Gemini to extract the topic, allowing us to correlate the acoustic stress metrics with the actual task.</p>
</div>
</div>
</div>

---
layout: default
---

<div class="h-full w-full flex flex-col justify-start px-12 py-10 relative bg-[#F5F5F7]">
<div class="space-y-1 mb-4 w-full">
<h2 class="text-3xl font-sans font-bold text-[#1D1D1F]">Moods & Metrics</h2>
</div>
<div class="w-full flex-grow relative z-10 h-0">
<MoodsMetricsDashboard />
</div>
</div>

---
layout: default
---

<div class="h-full w-full flex flex-col justify-start px-12 py-10 relative bg-[#F5F5F7]">
<div class="space-y-1 mb-4 w-full">
<h2 class="text-3xl font-sans font-bold text-[#1D1D1F]">Audio Sentiment Analysis</h2>
</div>
<div class="w-full flex-grow relative z-10 h-0">
<SentimentDashboard />
</div>
</div>

---
layout: default
---

<div class="h-full w-full flex flex-col justify-start px-12 py-10 relative bg-[#F5F5F7]">
<div class="flex flex-col justify-start gap-2 mb-6 w-full shrink-0">
<h1 class="!text-[1.8rem] !font-bold !text-[#1D1D1F] !m-0 !leading-tight " >Real-World Impact & The Market Opportunity</h1>
</div>
<div class="grid grid-cols-3 gap-5 w-full flex-grow items-stretch min-h-0">
<div class="flex flex-col bg-white p-5 rounded-xl border border-black/[0.05] shadow-sm relative overflow-hidden font-sans">
<div class="absolute top-0 left-0 right-0 h-1 bg-[#005F73]"></div>
<div class="flex flex-col items-start gap-2 mb-3 mt-1 shrink-0">
<div class="w-6 h-6 rounded bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-[0.7rem]">1</div>
<div class="text-[0.75rem] font-bold  text-[#1D1D1F] m-0 leading-snug">The Enterprise Case<br/><span class="text-[0.6rem] text-black/40 font-normal capitalize">(Preventing Employee Churn)</span></div>
</div>
<div class="text-[0.65rem] font-light text-black/60 leading-relaxed m-0">Burnout is a <span class="font-medium text-[#005F73]">$300 billion problem</span>. It is the invisible leading indicator of employee churn. By aggregating anonymized VAD metrics across teams, engineering managers and HR can identify systemic burnout weeks before productivity actually drops or developers quit.</div>
</div>
<div class="flex flex-col bg-white p-5 rounded-xl border border-black/[0.05] shadow-sm relative overflow-hidden font-sans">
<div class="absolute top-0 left-0 right-0 h-1 bg-[#005F73]"></div>
<div class="flex flex-col items-start gap-2 mb-3 mt-1 shrink-0">
<div class="w-6 h-6 rounded bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-[0.7rem]">2</div>
<div class="text-[0.75rem] font-bold  text-[#1D1D1F] m-0 leading-snug">The Self-Quantification Evolution<br/><span class="text-[0.6rem] text-black/40 font-normal capitalize">(Bio-hacking)</span></div>
</div>
<div class="text-[0.65rem] font-light text-black/60 leading-relaxed m-0">We track our sleep with Oura and our workouts with Apple Watch. MoodFlow is the missing layer: <span class="font-medium text-[#005F73]">Cognitive Fitness</span>. By proving which tasks deplete your 'Arousal' (energy) and which build 'Valence' (positivity), users can scientifically bio-hack their schedules—moving high-cognitive tasks to their peak emotional hours.</div>
</div>
<div class="flex flex-col bg-white p-5 rounded-xl border border-black/[0.05] shadow-sm relative overflow-hidden font-sans">
<div class="absolute top-0 left-0 right-0 h-1 bg-[#005F73]"></div>
<div class="flex flex-col items-start gap-2 mb-3 mt-1 shrink-0">
<div class="w-6 h-6 rounded bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-[0.7rem]">3</div>
<div class="text-[0.75rem] font-bold  text-[#1D1D1F] m-0 leading-snug">Clinical & Therapeutic Potential</div>
</div>
<div class="text-[0.65rem] font-light text-black/60 leading-relaxed m-0 mt-[0.85rem]">Therapy relies heavily on subjective, memory-biased self-reporting ("How was your week?"). MoodFlow creates an <span class="font-medium text-[#005F73]">objective, verifiable acoustic log</span> of a patient's emotional state over time, providing immense baseline data for mental health professionals.</div>
</div>
</div>
</div>

---
layout: default
---

<div class="h-full w-full flex flex-col justify-start px-12 py-10 relative bg-[#F5F5F7]">
<div class="space-y-1 mb-8 w-full">
<h2 class="text-3xl font-sans font-bold text-[#1D1D1F]">Research & References</h2>
</div>
<div class="w-full flex-grow relative z-10 flex flex-col gap-5 pl-4 overflow-y-auto">
<!-- Item 1 -->
<div class="flex flex-col gap-1">
<a href="https://www.thelancet.com/journals/lanpsy/article/PIIS2215-0366(19)30475-4/fulltext" target="_blank" class="text-base font-medium text-[#005F73] hover:text-teal-600 transition-colors">The burden of mental disorders across the states of India</a>
<div class="flex items-center gap-2 text-[0.65rem] text-black/50">
<span class="font-bold text-[#4f5c59] ">thelancet.com</span>
<span>&bull;</span>
<span>1 in 7 Indians suffer from mental disorders</span>
</div>
</div>
<!-- Item 2 -->
<div class="flex flex-col gap-1">
<a href="https://www.who.int/india/health-topics/mental-health" target="_blank" class="text-base font-medium text-[#005F73] hover:text-teal-600 transition-colors">Mental Health in India - WHO</a>
<div class="flex items-center gap-2 text-[0.65rem] text-black/50">
<span class="font-bold text-[#4f5c59] ">who.int</span>
<span>&bull;</span>
<span>Mental health burden and economic impact in India</span>
</div>
</div>
<!-- Item 3 -->
<div class="flex flex-col gap-1">
<a href="https://arxiv.org/abs/2006.11477" target="_blank" class="text-base font-medium text-[#005F73] hover:text-teal-600 transition-colors">wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations</a>
<div class="flex items-center gap-2 text-[0.65rem] text-black/50">
<span class="font-bold text-[#4f5c59] ">arxiv.org</span>
</div>
</div>
<!-- Item 4 -->
<div class="flex flex-col gap-1">
<a href="https://cdn.openai.com/papers/whisper.pdf" target="_blank" class="text-base font-medium text-[#005F73] hover:text-teal-600 transition-colors">Robust Speech Recognition via Large-Scale Weak Supervision (Whisper)</a>
<div class="flex items-center gap-2 text-[0.65rem] text-black/50">
<span class="font-bold text-[#4f5c59] ">openai.com</span>
</div>
</div>
<!-- Item 5 -->
<div class="flex flex-col gap-1">
<a href="https://www.researchgate.net/publication/354220704_Emotion_Recognition_from_Speech_Using_wav2vec_20_Embeddings" target="_blank" class="text-base font-medium text-[#005F73] hover:text-teal-600 transition-colors">Emotion Recognition from Speech Using wav2vec 2.0 Embeddings</a>
<div class="flex items-center gap-2 text-[0.65rem] text-black/50">
<span class="font-bold text-[#4f5c59] ">researchgate.net</span>
</div>
</div>
<!-- Item 6 -->
<div class="flex flex-col gap-1">
<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11841862/" target="_blank" class="text-base font-medium text-[#005F73] hover:text-teal-600 transition-colors">Speech Emotion Recognition using Fine-Tuned wav2vec2.0 Models</a>
<div class="flex items-center gap-2 text-[0.65rem] text-black/50">
<span class="font-bold text-[#4f5c59] ">ncbi.nlm.nih.gov</span>
</div>
</div>
</div>
</div>
