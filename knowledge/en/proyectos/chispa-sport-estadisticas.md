---
title: Chispa Sport, Advanced Baseball and Softball Statistical Analytics
summary: Sports analytics platform providing amateur and collegiate leagues with professional-grade situational statistics, featuring a public API, WordPress integration plugin, and mobile scorekeeping app.
organizacion: Chispa Sport
rol: Chief Architect and Sole Developer
inicio: 2014-07
fin: 2016-07
parte_de: experiencia/freelance-2014-2016
tecnologias: [php, laravel, postgresql, html, css, javascript, api-rest, wordpress, phonegap]
visibilidad: public
---

## Context

In baseball and softball, official scorekeepers record game action by hand on paper scorebooks: rosters, inning-by-inning box scores, and aggregate batting, fielding, and pitching tallies. Professional organizations convert these raw logs into rich situational analytics; amateur, scholastic, and minor leagues typically lack the tools to do so.

Chispa Sport was founded to bridge that gap: centralizing game performance data for leagues, teams, and players to deliver the analytical depth of professional baseball to amateur sports.

## My Role

I engineered the entire platform independently: relational schema architecture, backend API, administrative interfaces, hybrid mobile applications, brand logo, and UI/UX design. The founder and commercial partner led league acquisition and marketing.

## Technical Decisions

**The relational schema was the core technical challenge, not trivial CRUD coding.** Standard sports hierarchies—leagues, divisions, teams, rosters, and seasons—are straightforward. The genuine engineering complexity lies in situational *splits*: a batter's average specifically against left-handed vs right-handed pitchers, with bases loaded, with two outs in the final inning, in a specific ballpark, or facing a particular divisional rival.

Deriving these metrics requires storing far more than box-score summaries: the database must record the contextual state of every pitch and play (base runners, pitch counts, outs, field position) rather than just the final outcome. I architected the schema in PostgreSQL with this granular event-sourcing requirement from inception, resulting in a robust analytics engine that was exceptionally difficult to replicate.

**Flexible distribution models.** Rather than forcing leagues into a rigid proprietary portal, organizations could either adopt a turnkey standalone league website or install our custom WordPress plugin connected via REST API to embed live standings, box scores, schedules, and player cards directly into their existing web domains.

**Migration from Vanilla PHP to Laravel.** The initial prototype was built in vanilla PHP. For the production platform, I rebuilt the entire application on Laravel with structured web and API route namespaces, enabling the WordPress plugin and mobile clients to consume identical endpoints. This was my first production project with Laravel, which became my primary backend framework throughout the subsequent decade.

## Real-Time Mobile Scorekeeping App

To eliminate paper scorebooks and tedious post-game manual data entry, I built a mobile app for on-field scorekeepers to record live game events pitch by pitch: pitch types, ball contact coordinates charted on an interactive field diamond, base runner advancements, and substitutions.

As the scorekeeper logged live action, spectator portals and mobile apps updated in real time. I solved live updates using carefully throttled polling: the mobile app queried the game status endpoint only while the user was actively inspecting that game view; once the API signaled that the game was officially closed, it cached the final box score permanently and halted polling.

The scorekeeping app was fully developed and validated in scrimmage games, but had not yet launched publicly when the business was paused.

## Commercial Traction and Outcome

Approximately five complete leagues with all constituent teams, alongside roughly fifteen independent teams. Key deployments included official statistics for the Venezuelan Softball League and an international softball tournament hosted in Venezuela.

The public spectator app was the first mobile application I published to the Google Play Store.

The venture was halted in 2016 due to client financial constraints and macroeconomic challenges in the region. Active leagues were maintained, but new development ceased.
