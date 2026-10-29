# Halloween Prontera Atmosphere Plan

## Goal

Add client-only Halloween ambience that uses RO audio and SPR assets: a Prontera soundtrack override, occasional bat flyovers, and ghost sprites attached to selected undead monsters. All visuals follow the existing local holiday toggle and never alter server packets or entity gameplay state.

## Files

- `src/halloween/halloween-world-runtime.mjs`: own the client-only map music and sprite effect lifecycle behind injected engine APIs.
- `scripts/patch-v2-runtime.mjs`: inject the runtime adapter into the existing map renderer completion path.
- `test/halloween-world-runtime.test.ts`: cover map scoping, settings changes, effect cleanup, and the renderer patch anchor.
- `vendor/v2/Online.js`: update only if the established source-patching flow requires a synchronized vendor change.

## Tasks

1. Add focused tests for seasonal Prontera music, non-Prontera restoration, bat scheduling, and adding/removing ghost attachments on eligible live mobs.
2. Implement a small runtime adapter that uses the existing `BGM`, `Entity`, `EntityManager`, `DB`, and `Client` APIs. Use `84.mp3` (Niflheim) for Prontera during the holiday and `DB.getMap(...).mp3` otherwise.
3. Inject the adapter after successful map loads. Create ambient bats as non-targetable `TYPE_EFFECT` entities with client SPR/ACT attachments; attach a game ghost sprite to a small explicit mob ID list and remove the attachment when effects turn off.
4. Run focused unit tests and static diff checks. Leave visual login testing to the user.

## Boundaries

- No packets, server status, drops, combat state, or real monster fields are changed.
- BGM preference and volume remain controlled by the native client.
- Ambient effects are map-scoped, capped to one flying bat at a time, and removed on map/toggle changes.
- No new resource origin or executable resource is introduced.
