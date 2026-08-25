# Presenting Perturb-ODE — a prep guide

This is written to get you talking fluently, not to be read aloud. Read it once end to end, then skim the Q&A section right before you present. Every number here is traceable to `report.md` / `BASELINE.md` / `slides/main.tex` — if your professor asks "where does that come from," you can point to a specific run, not a vibe.

---

## 1. The 30-second version

> "Existing methods predict a genetic combination's effect by combining the two genes' representations *before* running any model — sum or concatenate embeddings, one forward pass. I instead compose the *dynamics themselves*: integrate one coupled trajectory where both genes' effects interact at every instant, not just once at the input. I checked first, using the original paper's own measured data, that real gene combinations actually deviate from additivity — they do, substantially. Then I built a model whose only structural difference from every baseline is *how it combines two genes*, and showed composing the vector field beats adding it, consistently across 5 independent seeds, while still losing honestly to a couple of baselines in a couple of places I disclose rather than hide."

That's the whole thesis. Everything else is detail and defense.

---

## 2. Background: what is a Neural ODE, and why would you use one here

Don't over-formalize this for a professor who may know it already — read the room. But have the clean version ready.

**The core idea.** A normal deep network is a *stack* of discrete transformations: `z1 = f1(z0)`, `z2 = f2(z1)`, ..., each layer a discrete step. A ResNet block is literally `z_{t+1} = z_t + f(z_t)` — a residual update. Neural ODEs (Chen et al., NeurIPS 2018, "Neural Ordinary Differential Equations") notice that as you take the step size to zero and add more layers, that recursion becomes an ODE:

```
dz/dt = f(z(t), t)
```

Instead of a fixed number of discrete layers, you specify the *instantaneous rate of change* of the hidden state, and get `z(1)` by numerically integrating from `z(0)`:

```
z(1) = z(0) + ∫₀¹ f(z(t), θ) dt
```

You solve this with any ODE solver (Euler, RK4, adaptive dopri5, etc.) — in this project, `torchdiffeq`'s RK4, fixed step count.

**Why this framing over a plain feedforward net:**
- **A continuous trajectory is a more natural hypothesis for a continuous physical process.** A cell moving from its control state to its perturbed state isn't teleporting — it's undergoing continuous biochemical change. Modeling it as a trajectory rather than a single opaque transformation is a *closer match to what's actually happening*.
- **It gives you a natural, principled way to compose two forces.** If you have two independent perturbations each inducing a vector field `f(z, p1)` and `f(z, p2)`, physics gives you the obvious way to combine them: superpose the fields and integrate the sum, `dz/dt = f(z,p1) + f(z,p2)`. This is *not* the same as combining the two perturbations' representations and running one network once — see below, this is the whole point.
- **The alternative (adjoint method) makes it memory-cheap to train**, though this project trains with direct backprop through the solver, not the adjoint — worth knowing that distinction exists even if you didn't use it (see Q&A).

**What it buys you specifically for combinations.** Every baseline in this comparison (GEARS, Scouter) combines a combination's two genes *statically*, before any computation runs: sum or concatenate their embeddings, then do one forward pass. Any interaction between the two genes can only ever be represented as a fixed correction baked into that single combination step — it cannot depend on the *state the cell is currently in* partway through its response. A composed vector field can: at every instant of the integration, the network re-evaluates how much each gene's influence matters *given where the cell currently is in its response trajectory*. That's a structurally different hypothesis about how genetic interaction works, not just a fancier way to fit the same function.

---

## 3. The problem, precisely

- **Input**: a cell's control-state gene expression profile, plus the identity of 1 or 2 genes being perturbed (CRISPRi knockdown).
- **Output**: predicted post-perturbation expression profile.
- **The hard case**: 2-gene combinations. The combinatorial space of gene pairs is enormous (>20,000 genes → hundreds of millions of possible pairs); real screens can only ever measure a tiny fraction. A model that generalizes from singles + a few measured combos to *unseen* combos turns an intractable experimental search into a tractable computational one.
- **Datasets**: K562 gwps (genome-wide CRISPRi, single-gene only, ~9,866 conditions), K562 essential (smaller, single-gene, cross-screen transfer test), Norman et al. 2019 (the only one of the three with *real* 2-gene combinations — 131 of them, plus single-gene conditions too).

---

## 4. Checking the premise *before* building anything

This is a step worth emphasizing to a professor, because it's the difference between "I assumed interaction matters" and "I verified it does, independently of my own model." Before training anything, you went to Norman et al. 2019's own **Table S9** — genetic-interaction metrics computed by the paper's original authors, using no model from this project at all — and checked:

- **`ts_score`** (R² of an additive linear fit to each combo's expression from its two singles: 1.0 = perfectly additive): median **0.71** across 124 real combos, **72.6% score below 0.8**. Most real combinations are measurably non-additive.
- **`emap`** (fitness-based genetic-interaction score, signed): **74 of 124** combos lean suppressive, **50 of 124** lean synergistic — real, bidirectional epistasis, not noise clustered at zero.

This is the empirical premise the entire architecture is a response to. If this had come back "actually everything is additive," composing vector fields would have no reason to help, and you'd know that *before* investing in the model.

---

## 5. The architecture, end to end

```
control_expr (gene_dim) ──► Encoder (Linear→LayerNorm→GELU→Linear) ──► z₀ (256-dim)
ESM2 embedding(s) (5120-dim, one per active gene) ──► PerturbationEmbedder ──► p_emb (128-dim each)

ODEVectorField: z(t) cross-attends over the active p_emb(s) → MLP → dz/dt
  dz/dt = f(z,p₁) + f(z,p₂) + g(z,p₁,p₂)     [g only for 2-gene combos]
  integrated via RK4 (torchdiffeq), fixed step count

z(1) ──► Decoder (MLP) ──► delta
output = control_expr + delta     (residual — decoder only predicts the CHANGE)
```

**Each piece and why:**

- **Whole-transcriptome panel, never HVG-reduced.** `gene_dim` is always the complete measured panel for the scenario (8,248 genes for K562 gwps, etc.) — checked directly (not assumed) that this doesn't inflate scores relative to a smaller HVG panel (see Q&A).
- **ESM2 protein embeddings for perturbation conditioning**, not a lookup table. Every held-out test gene, by construction, was never seen during training — a lookup embedding couldn't represent it at all. A frozen, pretrained *continuous function of gene identity* (projected through a small trainable MLP) gives every gene, seen or not, a meaningful embedding based on its actual protein sequence.
- **Cross-attention combination** (this is the "conditioning" upgrade over a naive concat): `z(t)` queries the active perturbation embedding(s) as key/value tokens. For a combination, the network can weight the two genes *differently depending on the current state* rather than with one fixed rule.
- **The composed vector field itself**, `f(z,p1) + f(z,p2) + g(z,p1,p2)`, integrated as one coupled trajectory. Because `f` is nonlinear, this is mathematically distinct from (a) summing the embeddings first and evaluating `f` once (GEARS/Scouter's move) or (b) integrating each gene's trajectory *separately* and adding the endpoints afterward (`forward_additive`, this project's own ablation baseline).
- **The HOI (higher-order-interaction) kernel `g`**: an explicit, dedicated small network for 2-gene combos, evaluated at every integration step, built from `p1+p2`, `p1·p2`, `|p1-p2|` — symmetric in the two genes by construction (verified: swapping gene order gives byte-identical output). This gives the model *direct* capacity to represent epistasis rather than relying on it to emerge implicitly from the additive sum of two `f` calls.
- **Uncertainty-weighted interaction loss**: an auxiliary loss term on the interaction residual specifically, weighted by a learned log-variance (Kendall et al.-style), so the model isn't forced to trade off aggregate-profile accuracy against interaction-specific accuracy with a fixed, hand-tuned coefficient.
- **Residual output**: decoder predicts `delta` only, output = `control + delta`. Never has to reconstruct a whole expression profile from scratch — just the change.
- **Individual-cell-pair training** (K562's headline strategy): control and perturbed cells paired at the individual-cell level, re-paired every epoch, rather than averaged into one pseudobulk profile before training. This is a *training-strategy* choice, orthogonal to the architecture, and turned out to be the single largest lever on K562 (more below).

---

## 6. Results — what to actually say, straight

**K562 (Replogle et al.), single-gene, `pearson_delta_top_de`** (Pearson correlation of predicted-vs-true post-control delta, restricted to each condition's own top-20 differentially-expressed genes):

| Scenario | n | GEARS | Scouter | Perturb-ODE (main model) |
|---|---|---|---|---|
| axis1 (in-distribution) | 954 | 0.055 | **0.210** | 0.176 |
| axis2_forward (cross-screen) | 1484 | 0.073 | 0.192 | **0.219** |

**Norman single-gene, 5-seed mean:**

| Model | Mean | Std |
|---|---|---|
| GEARS | **0.612** | 0.126 |
| Scouter | 0.610 | 0.072 |
| Perturb-ODE | 0.562 | 0.130 |

**Norman combo (real 2-gene combinations), 5-seed mean ± std, by generalization tier:**

| Model | Overall | seen0 | seen1 | seen2 |
|---|---|---|---|---|
| CPA | 0.529±.031 | 0.452±.165 | 0.511±.032 | 0.620±.043 |
| scGen | n/a | n/a | n/a | 0.915±.021 |
| **Perturb-ODE** | **0.781±.038** | 0.738±.170 | 0.772±.034 | 0.837±.050 |

**How to narrate this, honestly:**
- Beats GEARS (the field's canonical baseline) everywhere, at full statistical power.
- Beats Scouter on the *harder* K562 axis (cross-screen transfer) but loses to it on the easier one (in-distribution) — say this plainly, don't bury it. It's disclosed in your own deck for a reason.
- Beats CPA (a learned additive-latent competitor) on every combo tier. Loses to scGen specifically on seen2 — but scGen there is doing *literal empirical arithmetic* on real measured single-gene deltas, not a general learned function, and structurally cannot even be scored on seen0/seen1 (no learned deltas exist for genes never observed). This is the sharpest, most honest baseline in the whole comparison and it's fine to say so.
- On Norman single-gene, all three models are statistically indistinguishable (n=13-15 per seed, genuinely small and noisy) — don't oversell this row.

---

## 7. Ablations — what actually moved the needle, said honestly

This is your strongest material for credibility, precisely *because* some of it is a null or negative result you're reporting anyway.

**Composed vs. additive, across three architecture variants (Norman combo):**

| Configuration | Composed | Additive | Gap |
|---|---|---|---|
| Main model (attention+HOI+uncertainty) | 0.781±.038 | 0.739±.068 | 0.042±.035 |
| − attention/HOI/uncertainty (plain concat) | 0.769±.030 | 0.749±.035 | 0.021±.018 |
| Decoder → pathway-masked (KEGG+Reactome) | 0.770±.028 | 0.751±.027 | 0.019±.015 |

Composed beats additive in **every one of 5 seeds, in all three configurations** — the qualitative direction the whole thesis depends on. But say the caveat unprompted: **the gap itself does not clear a strict paired t-test in any configuration** (all three p ∈ [0.046, 0.064]), and the main model's absolute score is within about one baseline-seed's noise of the plain-concat version. Attention/HOI/uncertainty are validated, correctly-implemented components (symmetry-checked, gradient-masking-checked) — they just haven't yet been *shown*, with this amount of data, to raise the ceiling. That's a precise, defensible claim; "my model works because of the HOI kernel" is not.

**K562 training-strategy/attention isolation:**

| Configuration | axis1 | axis2_forward |
|---|---|---|
| Pseudobulk, plain concat | 0.130 | 0.152 |
| Pseudobulk + attention | 0.134 | 0.183 |
| **Per-cell, plain concat** | 0.176 | **0.219** |
| Per-cell + attention (combined) | **0.176** | *(pending)* |

Attention alone is a real, isolated gain (0.130→0.134 axis1; 0.152→0.183 axis2_forward). Individual-cell-pair training is a *much* bigger gain, and is what actually closes the gap with Scouter on axis2_forward. But — say this too — **combining per-cell training with attention adds essentially nothing on top of per-cell alone** (0.176 vs 0.176, identical to 3 decimal places). The two gains don't stack. You don't have a mechanistic explanation for this yet beyond "per-cell training may already be capturing most of what attention was contributing." If asked "why," say exactly that — an honest open question, not a dodge.

**Rejected alternatives** (all tested and found worse, no hedging needed — these are clean negatives):
- Flow-matching training objective (no `odeint` solve): 0.03–0.04 vs. 0.55–0.58 for standard supervised training. Clear failure.
- Factorized low-rank decoder (K=512): 0.046 vs. 0.064 for the plain MLP.
- Porting Scouter's own autofocus+direction loss: looked fine on the training proxy (0.581 vs 0.573) but regressed under real held-out eval (0.027 vs 0.078) — a genuine proxy/ground-truth divergence, confirmed twice.
- KNN graph augmentation (control-coexpression + GO-Jaccard): a statistical tie (0.634–0.664 vs. 0.662 baseline) — not a real effect either direction.
- Multi-control-cell ensembling alone: caused silent training collapse (val loss dropped while the real metric fell toward zero — the model was exploiting the smoothed input to cheaply predict near-zero delta). Recovers once paired with a contrastive loss.

---

## 8. The mechanistic diagnostic you should absolutely bring up if he probes "is the ODE doing anything real"

A solver-step sweep earlier showed something odd: 4-step RK4 outperformed the 8-step baseline, and a `no_ode` single-step control matched or slightly beat full integration. This *looks* like it undermines the whole "dynamics matter" story — a sharp reviewer (an external one, in your own project history) proposed a specific explanation: **the latent space is "flat"** — the velocity barely depends on the state, so one step already captures everything.

You built a direct mechanistic test for exactly that claim (`flat_latent_diagnostic.py`), not just another behavioral score comparison, across 4 independently-trained checkpoints:

| Checkpoint | cos(v0,v1) | curvature | ‖df/dz‖/‖df/dp‖ |
|---|---|---|---|
| 8-step (baseline) | 0.940 | 0.043 | **1.84** |
| no_ode | 0.928 | 0.048 | **1.52** |
| 4-step | 0.959 | 0.035 | **1.73** |
| 16-step | 0.962 | 0.034 | **1.64** |

`‖df/dz‖/‖df/dp‖ > 1` in **all four** checkpoints means the field's output changes *more* from moving through latent space than from switching which perturbation is active — the opposite of "state-independent." **The flat-latent-space explanation is refuted, not confirmed.** The trajectory is close to a straight line (curvature only 3-5% of chord length) with stable direction but *decaying velocity magnitude* (57-69% of initial by the end) — real, consistent structure, not "nothing happening." The better-supported explanation for why `no_ode` still wins: it's a *separately optimized* model with a direct target (`z0 + f(z0,p)` = correct answer), while the ODE-trained field has to get its *instantaneous* velocity right across a whole family of intermediate states with no supervision on those intermediate points — a strictly harder optimization problem, independent of whether the state space itself is flat.

Say this if asked "so is the ODE actually necessary" — you have a genuine mechanistic answer, not a shrug.

---

## 9. Full Q&A — every nitpick worth pre-loading an answer for

Organized by category. Read through once; you don't need to memorize word for word, just know where each answer lives.

### On Neural ODEs / the mechanism itself

**Q: What's the adjoint method, and did you use it?**
A: The adjoint method (Chen et al. 2018) computes gradients through the ODE solve by solving a second, backward-in-time ODE, at O(1) memory cost regardless of the number of solver steps — instead of backpropagating through the unrolled computational graph directly. This project trains with **direct backprop through the solver** (`torchdiffeq`'s non-adjoint mode), not the adjoint — a deliberate simplicity choice given the fixed, small step counts used (4-16 steps), where direct backprop's memory cost isn't prohibitive. The adjoint would matter more at much deeper integration.

**Q: Why RK4 and not an adaptive solver like dopri5?**
A: Tried dopri5 directly. Training failed to converge (flat loss) — most likely default tolerances (rtol=1e-4/atol=1e-5) interacting badly with direct backprop through a variable-length adaptive computational graph. Reported honestly as inconclusive, not folded into the "dynamics don't help" pattern — it would need separate tuning (different tolerances, or actually switching to the adjoint method) before being a fair comparison point. This is an open item, not a hidden failure.

**Q: Your solver-step sweep is non-monotonic — 4-step beat 8-step, which beat 16-step in one reading. Doesn't that mean the number of steps is arbitrary / doesn't matter?**
A: Behaviorally, yes, it's not a clean monotonic story. But see the mechanistic diagnostic (Section 8) — direct measurement (not just held-out score) shows the trajectory has real curvature and real velocity decay in every checkpoint, and refutes the "flat/trivial dynamics" explanation for why more steps didn't straightforwardly help. The likely explanation is an optimization-difficulty issue (harder to fit intermediate-point-implied dynamics from an endpoint-only loss), not that the ODE has nothing to model.

**Q: Isn't "compose the vector field" mathematically just a fancier additive combination once you Euler-discretize it?**
A: No — that's exactly the distinction being tested. If you take a single Euler step, `z1 ≈ z0 + f(z0,p1) + f(z0,p2)`, which superficially looks additive at the endpoint level. But integrated over multiple steps with a nonlinear `f`, `∫(f(z,p1)+f(z,p2))dt ≠ ∫f(z,p1)dt + ∫f(z,p2)dt` in general — the two genes' fields interact *through the shared, evolving state z(t)* at every step, which is precisely what the `forward_additive` ablation baseline (integrate each gene's trajectory *separately*, add the endpoints) removes. The composed-vs-additive gap in Section 7 is the direct empirical test of whether this distinction matters in practice, and it does (5/5 seeds), even though the effect size doesn't yet clear strict significance.

### On architecture design choices

**Q: What does the HOI kernel actually add, mechanistically, that the composed vector field + attention doesn't already give you?**
A: `f(z,p1)+f(z,p2)` gives the model capacity for interaction to emerge *implicitly* through the shared, evolving state — but it has no dedicated term whose only job is representing the joint (p1,p2) relationship. `g(z,p1,p2)`, built symmetrically from `p1+p2`, `p1·p2`, `|p1-p2|`, gives the model an explicit, structurally-guaranteed-symmetric channel for epistasis. Ablation shows this component, bundled with attention+uncertainty loss, doesn't yet demonstrate a significant absolute gain over the plain-concat baseline — an honest, disclosed negative, not something to oversell.

**Q: Why residual output (predict delta, not the full profile)?**
A: The vast majority of a cell's transcriptome doesn't change under a single or double perturbation — reconstructing the whole profile from scratch would force the decoder to relearn "everything that stays the same" for every condition. Predicting only the change is a much easier, more sample-efficient target, and matches how every other model in this comparison structures its own output.

**Q: Why ESM2 embeddings specifically, not something Norman/K562-specific?**
A: Frozen, pretrained protein embeddings are a *continuous function of gene identity* learned from a task (protein structure/sequence) totally independent of these perturbation screens — critical because every held-out test gene, by construction, was never seen during training. A lookup-table embedding has literally nothing to output for such a gene. ESM2 gives every gene (seen or not) a meaningful vector based on real biological similarity to genes it has seen.

### On experimental design / statistics

**Q: Your combo tiers have tiny n in places (seen0 as low as n=3 or n=4 in some seeds). How much should we trust a 5-seed mean built on that?**
A: Not blindly — this is disclosed explicitly, not smoothed over. seen0 std is 0.170, roughly 4-5x the std of seen1/seen2 — the deck's own honest-caveat framing calls this out directly. The overall/seen1/seen2 numbers rest on much larger, more stable per-seed samples (n=69-77 overall, n=42-51 for seen1). seen0's wide error bars are reported as-is rather than hidden or averaged away, and any claim resting specifically on seen0 alone is flagged as weak.

**Q: Did you correct for multiple comparisons across all these ablations?**
A: No formal correction (e.g., Bonferroni) was applied across the full set of ablation comparisons. Each reported p-value should be read as an individual test, not part of a family-wise-corrected claim. Given this, the honest framing throughout is "borderline, not yet significant" rather than claiming any single comparison as a clean discovery — which is exactly the language used (e.g., the composed-vs-additive gap: p ∈ [0.046, 0.064], explicitly called out as not clearing a strict bar).

**Q: What's the null floor for your metric — could a model score above zero by luck/artifact?**
A: Checked directly, not assumed. Two null checks exist: (1) a "predict = control" trivial baseline scores exactly 0.0 by mathematical construction (predicted delta is the zero vector). (2) A stronger null: score each condition's real truth/control against a *different, randomly mismatched* condition's prediction, 200 random pairings × all 5 seeds. Real scores clear the null's 97.5th percentile consistently. Margin-over-null (not raw score) is used as the fair comparison number specifically because different models can have different null floors — e.g., composed-VF's margin over null (0.220) vs CPA's (0.131) is a more honest comparison than raw scores alone.

**Q: Does the whole-transcriptome (not HVG-reduced) panel choice inflate your scores relative to competitors using a smaller panel (like scDFM's top-5,000/1,000 HVG)?**
A: Tested directly. K562 axis1 with a genuinely large panel (8,248 genes) shows real restriction effects (only 11.3/20 average DE-gene overlap between the two panel conventions) — and the difference runs in the *opposite* direction from an inflation concern. No evidence the larger panel is an easy-mode shortcut.

### On baseline fairness / scope

**Q: Why are CPA and scGen only compared on the combo task, and GEARS/Scouter only on single-gene — isn't that cherry-picking whichever comparison makes your model look best?**
A: This was a deliberate scoping decision tied to what question each baseline answers, not an omission discovered after the fact. GEARS's and Scouter's own combination mechanism (sum/concat embeddings, one forward pass) is *mechanistically identical* to this project's own `forward_additive` ablation, which is already tested directly on the combo task — running GEARS itself there would be structurally redundant with a comparison already covered. CPA and scGen were added specifically as **combo-task stress tests** — the question they exist to answer ("does a simpler additive-latent model already explain the gain over plain addition?") only bites on the combo task; single-gene was out of scope for them by design. This is documented as an acknowledged open gap (not a completed-and-hidden result) — worth doing directly if asked, and in fact was being actively worked on this session (real new adapter scripts written for CPA/Scouter on the missing scenarios) before being paused to focus on the core deck.

**Q: Scouter beats you on K562 axis1 (the easier axis). Doesn't that undercut the whole pitch?**
A: No — it's disclosed, not hidden, and it's informative rather than damaging: the model beats GEARS everywhere and beats Scouter specifically on the *harder* generalization axis (cross-screen transfer), where individual-cell-pair training closes the gap. Losing to Scouter on the *easier* in-distribution axis is a real, honest limitation to report, not evidence the core combinatorial-composition claim is wrong — Scouter's role in this comparison was never about combinatorial generalization in the first place (see above).

**Q: Is scGen beating you on seen2 a real weakness?**
A: It's real, but mechanistically explainable and not damaging to the core claim. scGen's seen2-only mechanism is *literal empirical arithmetic* on real, measured single-gene deltas (not a general learned function) — it has zero learned generalization capacity and cannot be scored at all on seen0/seen1 (no data to look up). It's the sharpest available baseline specifically because it has no dynamics or learning at all; losing to it narrowly on the one tier where its non-learned lookup has full information is not the same as losing to a competing *model*.

### On the metric

**Q: Why `pearson_delta_top_de` and not a simpler whole-panel Pearson (the number in some baseline papers)?**
A: Whole-panel Pearson is dominated by the majority of genes that don't move under a perturbation — a fundamentally easier, less informative number (this is explicitly why an earlier "0.7 PCC" literature target was rejected as the wrong benchmark: it traces to a different model/split/pipeline reporting a different, easier metric). Restricting to each condition's own top-20 real differentially-expressed genes (Wilcoxon-selected, ranked by absolute effect size so knockdown-driven *down*-regulation of the targeted gene itself counts) focuses the score on whether the model gets the biologically meaningful part of the response right, not the 95% of the transcriptome that's unchanged either way.

**Q: Could this metric be gamed — e.g., is there a way to score positively without predicting anything real?**
A: Checked directly (Section 8 / null-floor discussion above) — a "predict no change" trivial model scores exactly 0.0, and a randomly-mismatched-condition null is cleared by every real model's score at the 97.5th-percentile level, across all 5 seeds. Not proof against every conceivable gaming strategy, but a real, tested floor, not an assumed one.

### On practicality / scale

**Q: Does this scale? ESM2 embeddings are 5,120-dim, and integrating an ODE at every training step sounds expensive versus one forward pass.**
A: Training cost is real and higher than a single-forward-pass static baseline (4-16 solver steps × forward+backward per step vs. 1). This wasn't benchmarked head-to-head against GEARS/Scouter's own wall-clock training time in this project and would be a fair thing to quantify if pushed. At inference, the cost is the same multiplicative factor (a handful of solver steps), which is still cheap in absolute terms (milliseconds) relative to running an actual wet-lab CRISPR screen — the entire point of the exercise.

**Q: What happens beyond 2-gene combinations — does the HOI kernel generalize to 3+ genes?**
A: As built, `g(z,p1,p2)` is specifically a pairwise term. The base composed field `Σf(z,pi)` generalizes trivially to any number of simultaneous perturbations (just sum more terms), but higher-order interaction beyond pairs would need either a proper N-way generalization of `g` or accepting that only pairwise epistasis is explicitly modeled, with anything beyond that relying on the implicit shared-state mechanism alone. This project's data (Norman 2019) only has 2-gene combos, so this wasn't tested.

### On the uncertainty-weighted loss

**Q: What does the learned log-variance in the uncertainty-weighted loss actually represent — is it calibrated to anything real?**
A: It's a Kendall-et-al.-style learned scalar controlling the relative weight between the aggregate-profile loss and the interaction-residual auxiliary loss during training — it's a training-time weighting mechanism, not a claimed per-prediction calibrated uncertainty estimate. A secondary, practical finding flagged honestly in this project's own notes: checkpoint selection under this mode used `val_loss`, which *includes* these learned regularization terms and isn't a clean unweighted quality signal — re-selecting checkpoints by the real eval metric directly is a natural refinement not yet done.

### On novelty / prior work

**Q: How is this different from scDFM (the one dynamics-based competitor you mention but didn't integrate)?**
A: scDFM (ICLR 2026, distributional flow matching) is the closest match in spirit — also dynamics-based. It wasn't integrated because of real, structural incompatibilities: it reduces to its own top-5,000/1,000-HVG subsets (not this project's whole-transcriptome panel), its 5,000-gene vocabulary is tied to a fixed pretrained tokenizer (not a swappable gene list), and its own split system hardcodes a 15-condition test cap with no clean seam to substitute GEARS's own splits. This is scoped as real follow-up engineering work, not attempted this pass — say this plainly if asked, it's a genuine gap, not a hidden one.

**Q: GEARS already uses a GNN over a gene-gene graph — isn't that also "modeling interaction," just differently?**
A: Yes, and it's worth being precise about the distinction: GEARS's GNN models interaction *structurally*, through a fixed gene-gene coexpression/GO graph, encoded once before the perturbation is even applied — it's still a single static combination step at the point where the two perturbations are actually applied together. The distinction this project draws is specifically about *when and how* two simultaneous perturbations' effects are combined: before any dynamics run (GEARS, Scouter) vs. continuously, throughout an integrated trajectory (this work). Both are legitimate ways to try to capture interaction; this project isolates and tests one specific structural difference rather than claiming GEARS ignores interaction entirely.

---

## 10. Delivery notes

- **Lead with the negative result you're proudest of disclosing**, not defensive about — e.g., "combining per-cell training with attention adds nothing on top of per-cell alone, and I don't yet know why." A professor nitpicking for weaknesses who hears you volunteer this *before* he finds it himself will trust every other number you show him more, not less.
- **When asked "is this a clean win," resist the urge to oversell.** The honest, correct answer is: the model is better overall (real, disclosed wins over GEARS everywhere and over Scouter/CPA on their harder axes), but the *specific* composed-vs-additive gap — while consistent in direction across every seed and configuration — has not yet cleared strict statistical significance. These are two different claims; keep them separate out loud, the way the deck itself does.
- **If he asks a question you don't have a number for** (training wall-clock time vs. baselines is the most likely one), say exactly that — "I haven't benchmarked that directly, here's my best estimate of why it would/wouldn't matter" — rather than guessing a specific number.
- **Have Section 8 (the mechanistic diagnostic) ready as your single best "I anticipated the obvious objection and tested it directly" moment.** It's the strongest evidence in the whole project that this isn't just curve-fitting — it's a case where an external reviewer's specific alternative hypothesis was directly, mechanistically refuted rather than argued against.
