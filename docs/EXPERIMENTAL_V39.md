# Experimental visualisation programme — V3.9

## What experimental means

An exploratory way to answer a useful data question, with explicit encodings, assumptions and limitations. It does not mean visually spectacular decoration, an invented statistic or a claim of scientific validation. Experimental entries are labelled in the Templates window and the editor.

## Implemented

| View | Question | Encoding | Cautions |
|---|---|---|---|
| Evidence lanes | Does a headline median hide spread, outliers or very different sample sizes? | Shared numerical axis, jittered observations, min–max line, middle-50% band, median and n | Linear-interpolated empirical quartiles; no interval inference. First 10 groups; up to 180 displayed observations per lane; all valid values determine summaries. |
| Change lens | How do absolute before/after levels relate to signed differences? | Aligned hollow/filled endpoints and a separate symmetric signed-difference scale | Same units and complete pairs only. At most 12 groups. No causal claim. An aggregate difference need not describe every individual. |

Neither is presented as a new mathematical invention. The combination and interface are the experiment. Known techniques should keep their familiar explanations.

## Flourish overlap and uncertainty

Official Flourish documentation describes box/violin/beeswarm combinations, including individual observations and distribution summaries. Its documentation also discusses connected-dot/dumbbell charts for before/after comparisons. Those components overlap these designs. We did not verify whether a ready-made Flourish template reproduces either exact composition, and absence from a web search is not evidence of absence.

Sources reviewed 16 November 2026:
- https://helpcenter.flourish.studio/hc/en-us/articles/9859136207759-How-to-make-box-violin-and-beeswarm-scatter-plots
- https://flourish.studio/blog/scatter-vs-dot-plot/

## Proposed next experiments — not implemented or advertised as available

**Assumption lens:** compare how conclusions/rankings change under explicit aggregation, weighting or missing-data rules. The output should reveal sensitivity rather than declare one method correct. Requires clearly specified rules and comparable units.

**Disagreement map:** show when subgroup results disagree with the overall headline. Display subgroup size, uncertainty where actually supplied/computed under stated assumptions, and weighting. Flag possible reversals for inspection rather than implying causation.

**Missingness atlas:** link a field/record missingness view to the charts affected by exclusions. Compare the retained sample against excluded records where the data permits, without inventing missing values.

These proposals may have equivalents elsewhere. Their value must come from usability and truthful communication, not unsupported novelty claims.

## Acceptance before expanding the experimental section

Independent arithmetic checks, source safety, field contracts, export fidelity and honest limits are required. User trials should test whether people understand the encoding and whether it helps them detect a pattern they would otherwise miss. Compare with conventional alternatives; retire experiments that confuse more than they clarify.
