# Trialum — Master planning index (24 November 2026)

> **Status: planning/documentation only. No game, release, licensing, repository-visibility, signing, or production changes are authorized by these files.** This index is an entry point for the 24 November 2026 product-direction discussion; technical implementation still requires code review, QA and owner acceptance.

## Latest owner product direction

**[Master Transformation & Living World — v1.1](TRIALUM_MASTER_TRANSFORMATION_PLAN_20261124_v1.1_LIVING_WORLD.md)** is the latest dated planning record from 24 November. It contains the original Classic transformation tasks **T01–T21**, plus **T22–T37** on a full synthetic civilization: living inhabitants, homes, real jobs, school/hospital/fire/police/workshops, public treasury, individual budgets, synthetic biodiversity, 2D/Classic city map and future 3D city. The shared simulation engine should support distinct Classic and 3D views; this remains an architectural target, not an implemented capability.

**[Master Transformation — v1.0 historical snapshot](TRIALUM_MASTER_TRANSFORMATION_PLAN_20261124_v1.0.md)** preserves the prior 21-task plan and its historical Portrait-only assumption. Keep it for audit/history; it is **not** the current orientation decision.

### Orientation decision — explicitly reopened

**Portrait-only is no longer final.** Compare a coherent all-Portrait variant against a coherent all-Landscape variant using the same tasks/scene on a phone. Do not rotate the device during gameplay. No orientation change is approved for implementation by documentation alone.

### Stage gates and compatibility

1. Preserve existing engine, saves, pet identities/memory, offline-first behavior, accessibility, privacy, Android package/signing identities, and owner-accepted functionality.
2. Focus first on a compelling first **0–10 minutes** and a real first pet, followed by one working city *vertical slice* (home → job → salary → production → purchase → return), rather than decorative placeholder buildings.
3. Future economy and ecology must be causal, testable, bounded and compatible with device performance; agents should be autonomous within explicitly defined rules.
4. This product vision does not independently override earlier GLB/Three.js, owner-acceptance, and release gates or approve changes on another repository.

### Existing documentation to reconcile before code work

- [Living World roadmap](TRIALUM_LIVING_WORLD_ROADMAP_2026.md) and [Living World vision](TRIALUM_LIVING_WORLD_VISION_20261114.md)
- [Shared mini-city proposal](TRIALUM_SHARED_MINI_CITY_PROPOSAL_20261115.md): multi-player / consented shared spaces remain a separate future architecture and must not be conflated with one player's private simulated city
- [3D world master plan B0–B9](TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) and [ADR-005](ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md)
- [License transition](LICENSE_TRANSITION_2026-11-14.md): preserves prior legally valid MIT grants and does not imply retroactive revocation

### GitHub repository reorganization

The proposed split (Core/Classic/3D/Beta/Releases/Builders/Android-Builds/Server) is **not yet executed**. Before changing visibility, creating/deleting repositories, importing Git history or moving proprietary code into public CI, inventory branches, license status, artifacts, third-party dependencies and backup restoration. New public Builder pipelines must not check out private proprietary sources.

**Review rule:** Treat v1.1 as the latest product-vision source, v1.0 as historical, and every existing phase-specific technical gate as binding until reconciled and explicitly accepted by the owner. This PR adds planning files only.
