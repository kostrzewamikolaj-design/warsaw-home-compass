# Methodology

This document explains how the Warsaw Rent vs Buy MVP thinks about the rent-versus-buy decision. It is intentionally plain-language and should be improved before any production launch.

## What The Calculator Compares

The calculator compares two simplified paths for a chosen Warsaw district and apartment size:

- Buy: pay a down payment, transaction costs, mortgage payments, HOA/admin fees, insurance, maintenance and renovation reserves, then own an apartment that may appreciate or decline in value.
- Rent: pay monthly rent and invest the upfront cash and any monthly cost difference compared with buying.

The model reports the estimated wealth difference between buying and renting over time. Positive values mean buying is ahead in that simulation path. Negative values mean renting and investing the difference is ahead.

## Core Assumptions

The MVP currently uses:

- district-level purchase price per square meter,
- district-level rent per square meter,
- apartment size by scenario,
- mortgage rate and down payment,
- transaction costs such as origination fee, notary cost, court fees and PCC for secondary market purchases,
- HOA/admin fees and escalation,
- maintenance reserve, renovation cost and insurance,
- rent growth,
- inflation,
- investment return for the renter's alternative portfolio,
- district appreciation bands.

The district appreciation bands are grouped as:

- Premium: Śródmieście, Żoliborz, Mokotów
- Stable: Ochota, Ursynów, Wilanów
- Growth: Wola, Bemowo, Praga-Południe
- Emerging: Białołęka, Targówek, Ursus
- Outer value: remaining districts in the MVP dataset

The visible "Bazowy wzrost wartości mieszkania" / home appreciation baseline slider is blended with the selected district's appreciation band. This prevents one global slider from fully overriding local district assumptions, while still letting users test optimistic and conservative views.

## Monte Carlo Simulation

The app runs at least 500 simulation paths in a Web Worker so the UI remains responsive.

Each path randomly varies annual appreciation, rent growth, inflation, mortgage rate shocks and investment returns around the selected assumptions. The chart then shows many possible future outcomes instead of one deterministic forecast.

Monte Carlo output should be read as a scenario range, not a prediction. It answers: "Under these assumptions, how often and how quickly might buying beat renting?"

## Break-Even

"Break-even" means the first year when buying has a non-negative estimated wealth difference versus renting and investing the difference.

The headline break-even is the median break-even year across simulation paths that reached break-even. The 95% confidence interval is an approximate percentile range from the simulated paths.

If the model cannot find a break-even within the 30-year horizon for enough paths, the UI may show "No break-even".

## Current Data Status

The MVP uses local static assumptions. They are not live listings, not bank quotes and not official property valuations.

Current static inputs include:

- district purchase prices,
- district rent levels,
- district appreciation bands,
- scenario defaults,
- transaction cost assumptions,
- mortgage and investment defaults.

The app includes a visible "estimated data / last updated" note so users do not mistake the MVP for a live market feed.

## What Needs Improvement Before Production

Before this becomes a serious public product, the methodology should be upgraded with:

- documented data sources for sale prices and rental asking prices,
- repeatable data refresh process and timestamps,
- clearer separation between primary and secondary market assumptions,
- bank-specific mortgage logic or validated mortgage assumptions,
- explicit treatment of taxes, vacancy, liquidity and selling timelines,
- better handling of uncertainty for each district,
- sensitivity tests for transaction costs and refinancing,
- independent review of financial formulas,
- clearer Polish legal and financial disclaimers.

This MVP is suitable for product validation and user feedback. It should not be marketed as a precise financial recommendation engine.
