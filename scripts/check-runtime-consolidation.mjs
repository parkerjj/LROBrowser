import { access, readFile } from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import ts from 'typescript';

const repo = fileURLToPath(new URL('../', import.meta.url));
const stages = new Set([
  'audio', 'sync', 'gameplay', 'receive', 'packet', 'localization',
  'ui-layout', 'ui-state', 'worldmap', 'final',
]);
const audioRelocatableOwners = [
  'function:installLastROWebAudio',
  'variable:LastROWebAudio',
  'function:installLastROAudioUnlock',
  'function:LastROAudioPlay',
  'function:LastROAudioUnlock',
  'function:LastROAudioRegisterContext',
  'call:installLastROAudioUnlock',
];
const audioSideEffectOwners = ['variable:LastROWebAudio', 'call:installLastROAudioUnlock'];
const stringKinds = new Map([
  [ts.SyntaxKind.StringLiteral, 'string'],
  [ts.SyntaxKind.NoSubstitutionTemplateLiteral, 'string'],
  [ts.SyntaxKind.TemplateHead, 'template-head'],
  [ts.SyntaxKind.TemplateMiddle, 'template-middle'],
  [ts.SyntaxKind.TemplateTail, 'template-tail'],
]);
const triviaKinds = new Set([
  ts.SyntaxKind.WhitespaceTrivia,
  ts.SyntaxKind.NewLineTrivia,
  ts.SyntaxKind.SingleLineCommentTrivia,
  ts.SyntaxKind.MultiLineCommentTrivia,
  ts.SyntaxKind.ShebangTrivia,
  ts.SyntaxKind.ConflictMarkerTrivia,
  ts.SyntaxKind.NonTextFileMarkerTrivia,
  ts.SyntaxKind.EndOfFileToken,
  ts.SyntaxKind.SyntaxList,
  ts.SyntaxKind.JSDocComment,
]);
const retiredTransforms = [
  { module: './lastro-network-receive-recovery.mjs', imported: 'patchRuntimeNetworkFramingRecovery', local: 'patchRuntimeNetworkFramingRecovery', callOwner: 'patchV2Runtime' },
  { module: './lastro-network-receive-recovery.mjs', imported: 'patchRuntimeNetworkCloseDrain', local: 'patchRuntimeNetworkCloseDrain', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'JOB_NAME_OVERRIDES', local: 'JOB_NAME_OVERRIDES', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'MESSAGE_FALLBACKS', local: 'MESSAGE_FALLBACKS', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'RUNTIME_TEXT_REPLACEMENTS', local: 'RUNTIME_TEXT_REPLACEMENTS', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'patchRuntimeMapLocalization', local: 'patchRuntimeMapLocalization', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'patchRuntimeStatusTooltips', local: 'patchRuntimeStatusTooltips', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'assertRuntimeLocalizationMount', local: 'assertRuntimeLocalizationMount', callOwner: 'patchV2Runtime' },
  { module: './lastro-audio-timing.mjs', imported: 'patchRuntimeAudioTiming', local: 'patchRuntimeAudioTiming', callOwner: 'patchV2Runtime' },
  { module: './lastro-skill-localization.mjs', imported: 'SKILL_DESCRIPTION_OVERRIDES', local: 'SKILL_DESCRIPTION_OVERRIDES', callOwner: 'patchV2Runtime' },
  { module: './lastro-skill-localization.mjs', imported: 'SKILL_NAME_OVERRIDES', local: 'SKILL_NAME_OVERRIDES', callOwner: 'patchV2Runtime' },
  { module: './lastro-npc-dialog-buttons.mjs', imported: 'patchRuntimeNpcDialogButtons', local: 'patchRuntimeNpcDialogButtons', callOwner: 'patchV2Runtime' },
  { module: './lastro-vending-movement.mjs', imported: 'patchRuntimeVendingMovement', local: 'patchRuntimeVendingMovement', callOwner: 'patchV2Runtime' },
  { module: './lastro-shop-titles.mjs', imported: 'patchRuntimeShopTitles', local: 'patchRuntimeShopTitles', callOwner: 'patchV2Runtime' },
  { module: './lastro-monster-hover-hp.mjs', imported: 'patchRuntimeMonsterHoverHp', local: 'patchRuntimeMonsterHoverHp', callOwner: 'patchV2Runtime' },
  { module: './lastro-frame-timing.mjs', imported: 'patchRuntimeFrameTiming', local: 'patchRuntimeFrameTiming', callOwner: 'patchV2Runtime' },
  { module: './lastro-entity-sync.mjs', imported: 'patchRuntimeEntitySync', local: 'patchRuntimeEntitySync', callOwner: 'patchV2Runtime' },
  { module: './lastro-equipment-animation.mjs', imported: 'patchRuntimeEquipmentAnimation', local: 'patchRuntimeEquipmentAnimation', callOwner: 'patchV2Runtime' },
  { module: './lastro-equipment-cart.mjs', imported: 'patchRuntimeEquipmentCart', local: 'patchRuntimeEquipmentCart', callOwner: 'patchV2Runtime' },
  { module: './lastro-manual-skill.mjs', imported: 'patchRuntimeManualSkill', local: 'patchRuntimeManualSkill', callOwner: 'patchV2Runtime' },
  { module: './lastro-skill-cooldown.mjs', imported: 'patchRuntimeSkillCooldown', local: 'patchRuntimeSkillCooldown', callOwner: 'patchV2Runtime' },
  { module: './lastro-weapon-view-fallback.mjs', imported: 'patchRuntimeWeaponViewFallback', local: 'patchRuntimeWeaponViewFallback', callOwner: 'patchV2Runtime' },
  { module: './lastro-movement-input.mjs', imported: 'patchRuntimeMovementInput', local: 'patchRuntimeMovementInput', callOwner: 'patchV2Runtime' },
  { module: './lastro-movement-sync.mjs', imported: 'patchRuntimeMovementSync', local: 'patchRuntimeMovementSync', callOwner: 'patchV2Runtime' },
  { module: './lastro-mail.mjs', imported: 'patchRuntimeMail', local: 'patchRuntimeMail', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-text.mjs', imported: 'patchRuntimeUiText', local: 'patchRuntimeUiText', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-messages.mjs', imported: 'patchRuntimeUiMessages', local: 'patchRuntimeUiMessages', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-layout.mjs', imported: 'patchRuntimeUiLayout', local: 'patchScopedUiLayout', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-state.mjs', imported: 'patchRuntimeUiState', local: 'patchRuntimeUiState', callOwner: 'patchV2Runtime' },
  { module: './lastro-store-scroll.mjs', imported: 'patchRuntimeStoreScroll', local: 'patchRuntimeStoreScroll', callOwner: 'patchV2Runtime' },
  { module: './lastro-storage-count.mjs', imported: 'patchRuntimeStorageCount', local: 'patchRuntimeStorageCount', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-input.mjs', imported: 'patchRuntimeUiInput', local: 'patchRuntimeUiInput', callOwner: 'patchV2Runtime' },
  { module: './lastro-emoticons.mjs', imported: 'patchRuntimeEmoticons', local: 'patchRuntimeEmoticons', callOwner: 'patchV2Runtime' },
  { module: './lastro-item-drag.mjs', imported: 'patchRuntimeItemDrag', local: 'patchRuntimeItemDrag', callOwner: 'patchV2Runtime' },
  { module: './lastro-item-name.mjs', imported: 'patchRuntimeItemName', local: 'patchRuntimeItemName', callOwner: 'patchV2Runtime' },
  { module: './lastro-party-state.mjs', imported: 'patchRuntimePartyState', local: 'patchRuntimePartyState', callOwner: 'patchV2Runtime' },
  { module: './lastro-typography.mjs', imported: 'patchRuntimeTypography', local: 'patchRuntimeTypography', callOwner: 'patchV2Runtime' },
  { module: './lastro-dialog-typography.mjs', imported: 'patchRuntimeDialogTypography', local: 'patchRuntimeDialogTypography', callOwner: 'patchV2Runtime' },
  { module: './lastro-navigation-ui.mjs', imported: 'patchRuntimeNavigationUi', local: 'patchRuntimeNavigationUi', callOwner: 'patchV2Runtime' },
  { module: './lastro-basic-info.mjs', imported: 'patchRuntimeBasicInfoLayout', local: 'patchRuntimeBasicInfoLayout', callOwner: 'patchV2Runtime' },
];

const relocatedBindings = [
  { retiredModule: './lastro-localization.mjs', retiredExport: 'JOB_NAME_OVERRIDES', module: './lastro-display-localization.mjs', imported: 'JOB_NAME_OVERRIDES', local: 'JOB_NAME_OVERRIDES', patcherImport: false },
  { retiredModule: './lastro-localization.mjs', retiredExport: 'MESSAGE_FALLBACKS', module: './lastro-display-localization.mjs', imported: 'MESSAGE_FALLBACKS', local: 'MESSAGE_FALLBACKS', patcherImport: false },
  { retiredModule: './lastro-localization.mjs', retiredExport: 'RUNTIME_TEXT_REPLACEMENTS', module: './lastro-display-localization.mjs', imported: 'RUNTIME_TEXT_REPLACEMENTS', local: 'RUNTIME_TEXT_REPLACEMENTS', patcherImport: false },
  { retiredModule: './lastro-localization.mjs', retiredExport: 'patchRuntimeMapLocalization', module: './lastro-display-localization.mjs', imported: 'patchRuntimeMapLocalization', local: 'patchRuntimeMapLocalization', callOwner: 'patchV2Runtime', patcherImport: true },
  { retiredModule: './lastro-localization.mjs', retiredExport: 'patchRuntimeStatusTooltips', module: './lastro-display-localization.mjs', imported: 'patchRuntimeStatusTooltips', local: 'patchRuntimeStatusTooltips', callOwner: 'patchV2Runtime', patcherImport: true },
  { retiredModule: './lastro-localization.mjs', retiredExport: 'assertRuntimeLocalizationMount', module: './lastro-display-localization.mjs', imported: 'assertRuntimeLocalizationMount', local: 'assertRuntimeLocalizationMount', callOwner: 'patchV2Runtime', patcherImport: true },
  { retiredModule: './lastro-skill-localization.mjs', retiredExport: 'SKILL_DESCRIPTION_OVERRIDES', module: './lastro-display-localization.mjs', imported: 'SKILL_DESCRIPTION_OVERRIDES', local: 'SKILL_DESCRIPTION_OVERRIDES', patcherImport: false },
  { retiredModule: './lastro-skill-localization.mjs', retiredExport: 'SKILL_NAME_OVERRIDES', module: './lastro-display-localization.mjs', imported: 'SKILL_NAME_OVERRIDES', local: 'SKILL_NAME_OVERRIDES', patcherImport: false },
  { retiredModule: './lastro-ui-text.mjs', retiredExport: 'patchRuntimeUiText', module: './lastro-display-localization.mjs', imported: 'patchRuntimeUiText', local: 'patchRuntimeUiText', callOwner: 'patchV2Runtime', patcherImport: true },
  { retiredModule: './lastro-ui-messages.mjs', retiredExport: 'patchRuntimeUiMessages', module: './lastro-display-localization.mjs', imported: 'patchRuntimeUiMessages', local: 'patchRuntimeUiMessages', callOwner: 'patchV2Runtime', patcherImport: true },
  { retiredModule: './lastro-emoticons.mjs', retiredExport: 'patchRuntimeEmoticons', module: './lastro-display-localization.mjs', imported: 'patchRuntimeEmoticons', local: 'patchRuntimeEmoticons', callOwner: 'patchV2Runtime', patcherImport: true },
  { retiredModule: './lastro-item-name.mjs', retiredExport: 'patchRuntimeItemName', module: './lastro-display-localization.mjs', imported: 'patchRuntimeItemName', local: 'patchRuntimeItemName', callOwner: 'patchV2Runtime', patcherImport: true },
];
const displayCoordinatorBindings = [
  { module: './lastro-display-localization.mjs', imported: 'patchRuntimeLocalization', local: 'patchRuntimeLocalization', callOwner: 'patchV2Runtime' },
];
const relocatedCoordinatorNames = ['patchRuntimeLocalization', 'patchRuntimeJobLocalization', 'patchRuntimeSkillLocalization'];

// Fixed specification matrix. Existing bundle owners may still be edited by
// retained product/diagnostic transforms; only migrated definitions are host-protected.
export const permanentRuntimeModules = [
  { module: './lastro-network-receive-recovery.mjs', owners: [
    { kind: 'function', name: 'receive', protectHost: false },
    { kind: 'function', name: 'onClose$9', protectHost: false },
  ] },
  { module: './lastro-frame-timing.mjs', owners: [
    { kind: 'function', name: 'LastROServerClockNow', protectHost: true },
    { kind: 'function', name: 'LastROResetServerTick', protectHost: true },
    { kind: 'function', name: 'LastROInvalidateServerTick', protectHost: true },
    { kind: 'function', name: 'LastROAdvanceServerTick', protectHost: true },
    { kind: 'function', name: 'LastROEventDueTick', protectHost: true },
    { kind: 'variable', name: 'lastroEventDueTick', protectHost: true },
    { kind: 'variable', name: 'lastroServerClockMark', protectHost: true },
    { kind: 'variable', name: 'lastroHasServerSample', protectHost: true },
    { kind: 'variable', name: 'init_Events', protectHost: false },
    { kind: 'variable', name: 'init_Renderer', protectHost: false },
  ] },
  { module: './lastro-audio-timing.mjs', owners: [
    { kind: 'function', name: 'installLastROWebAudio', protectHost: true },
    { kind: 'function', name: 'installLastroTimedWebAudio', protectHost: true },
    { kind: 'function', name: 'createLastroSoundTiming', protectHost: true },
    { kind: 'function', name: 'installLastROAudioUnlock', protectHost: true },
    { kind: 'function', name: 'LastROAudioPlay', protectHost: true },
    { kind: 'function', name: 'LastROAudioUnlock', protectHost: true },
    { kind: 'function', name: 'LastROAudioRegisterContext', protectHost: true },
    { kind: 'variable', name: 'LastROWebAudio', protectHost: true },
    { kind: 'variable', name: 'init_MemoryManager', protectHost: false },
    { kind: 'variable', name: 'init_MemoryItem', protectHost: false },
    { kind: 'variable', name: 'init_BGM', protectHost: false },
    { kind: 'variable', name: 'init_SoundManager', protectHost: false },
    { kind: 'variable', name: 'init_RainWeather', protectHost: false },
    { kind: 'call', name: 'installLastROAudioUnlock', topLevel: true },
  ] },
  { module: './lastro-entity-sync.mjs', owners: [
    { kind: 'function', name: 'findLastroServerWalkPath', protectHost: true },
    { kind: 'function', name: 'lastroRouteJoinActive', protectHost: true },
    { kind: 'function', name: 'lastroClearRouteJoin', protectHost: true },
    { kind: 'function', name: 'lastroCaptureRouteJoin', protectHost: true },
    { kind: 'function', name: 'lastroJoinServerRoute', protectHost: true },
    { kind: 'function', name: 'lastroProjectWalkDistance', protectHost: true },
    { kind: 'function', name: 'WalkStructure', protectHost: false },
    { kind: 'function', name: 'walkTo', protectHost: false },
    { kind: 'function', name: 'walkProcess', protectHost: false },
    { kind: 'function', name: 'resetRoute', protectHost: false },
    { kind: 'function', name: 'computeWalkStartTick', protectHost: false },
  ] },
  { module: './lastro-movement-input.mjs', owners: [
    { kind: 'function', name: 'lastroCanPassPlayerClick', protectHost: true },
    { kind: 'function', name: 'createLastroMovementInput', protectHost: true },
    { kind: 'function', name: 'refreshLastroGroundInput', protectHost: true },
    { kind: 'function', name: 'onMouseUpCapture', protectHost: false },
    { kind: 'function', name: 'onMouseDown', protectHost: false },
    { kind: 'variable', name: 'init_MapControl', protectHost: false },
  ] },
  { module: './lastro-movement-sync.mjs', owners: [
    { kind: 'function', name: 'lastroBodyMovementBlocked', protectHost: true },
    { kind: 'function', name: 'lastroMovementBlocked', protectHost: true },
    { kind: 'function', name: 'lastroCancelMovement', protectHost: true },
    { kind: 'function', name: 'lastroMovementUnavailable', protectHost: true },
    { kind: 'function', name: 'lastroCheckMovementConnection', protectHost: true },
    { kind: 'function', name: 'lastroCaptureHitRoute', protectHost: true },
    { kind: 'function', name: 'lastroHitStartTick', protectHost: true },
  ] },
  { module: './lastro-equipment-animation.mjs', owners: [
    { kind: 'function', name: 'lastroBeginEquipmentFrame', protectHost: true },
    { kind: 'function', name: 'lastroEndEquipmentFrame', protectHost: true },
    { kind: 'function', name: 'sampleLastroCostumeLoop', protectHost: true },
    { kind: 'variable', name: 'init_EntityRender', protectHost: false },
  ] },
  { module: './lastro-equipment-cart.mjs', owners: [
    { kind: 'function', name: 'createEquipment', protectHost: false },
    { kind: 'function', name: 'onEntityStatusChange', protectHost: false },
    { kind: 'function', name: 'updateAttachmentButtons', protectHost: true },
  ] },
  { module: './lastro-weapon-view-fallback.mjs', owners: [
    { kind: 'function', name: 'UpdateGeneric', protectHost: false },
    { kind: 'variable', name: 'init_DBManager', protectHost: false },
    { kind: 'method', name: 'getWeaponFallbackViewID', region: 'src/DB/DBManager.js', protectHost: true },
  ] },
  { module: './lastro-manual-skill.mjs', owners: [
    { kind: 'function', name: 'onUseSkill', protectHost: false },
    { kind: 'function', name: 'moveCharacter', protectHost: false },
    { kind: 'variable', name: 'init_Skill', protectHost: false },
  ] },
  { module: './lastro-skill-cooldown.mjs', owners: [
    { kind: 'function', name: 'setDelayOnIndex', protectHost: false },
    { kind: 'variable', name: 'init_ShortCut', protectHost: false },
  ] },
  { module: './lastro-party-state.mjs', owners: [
    { kind: 'function', name: 'createLastroPartyState', protectHost: true },
    { kind: 'function', name: 'onPartyCreate', protectHost: false },
    { kind: 'function', name: 'onPartyIsAlive', protectHost: false },
    { kind: 'function', name: 'onPartyList', protectHost: false },
    { kind: 'function', name: 'onPartyMemberJoin', protectHost: false },
    { kind: 'function', name: 'onPartyMemberLeave', protectHost: false },
    { kind: 'function', name: 'onMemberLifeUpdate', protectHost: false },
    { kind: 'function', name: 'onMemberMove$1', protectHost: false },
    { kind: 'variable', name: '_lastroPartyState', protectHost: true },
  ] },
  { module: './lastro-monster-hover-hp.mjs', owners: [
    { kind: 'function', name: 'createLastroMonsterHoverHp', protectHost: true },
    { kind: 'variable', name: 'init_EntityManager', protectHost: false },
  ] },
  { module: './lastro-vending-movement.mjs', owners: [
    { kind: 'function', name: 'lastroVendingShoppingActive', protectHost: true },
    { kind: 'function', name: 'lastroSetVendingShopping', protectHost: true },
    { kind: 'function', name: 'lastroInstallVendingRemoval', protectHost: true },
    { kind: 'function', name: 'lastroCloseVendingShopping', protectHost: true },
    { kind: 'function', name: 'onRequestWalk', protectHost: false },
    { kind: 'function', name: 'cleanGameUI', protectHost: false },
    { kind: 'function', name: 'onMapChange', protectHost: false },
  ] },
  { module: './lastro-item-drag.mjs', owners: [
    { kind: 'function', name: 'installLastroItemDrag', protectHost: true },
  ] },
  { module: './lastro-ui-layout.mjs', owners: [
    { kind: 'variable', name: 'init_CashShop$2', protectHost: false },
    { kind: 'variable', name: 'init_EntityRoom$2', protectHost: false },
    { kind: 'variable', name: 'init_EntitySignboard$1', protectHost: false },
    { kind: 'variable', name: 'init_ChatRoomCreate$1', protectHost: false },
    { kind: 'variable', name: 'init_CartItems$1', protectHost: false },
    { kind: 'variable', name: 'init_Storage$3', protectHost: false },
    { kind: 'variable', name: 'init_SkillListV2$1', protectHost: false },
  ] },
  { module: './lastro-ui-input.mjs', owners: [
    { kind: 'function', name: 'lastroUiInputFrame', protectHost: true },
    { kind: 'function', name: 'lastroUiLogicalPointer', protectHost: true },
    { kind: 'function', name: 'lastroUiDragBounds', protectHost: true },
    { kind: 'function', name: 'bindMouseEvents', protectHost: false },
    { kind: 'variable', name: 'init_GUIComponent', protectHost: false },
  ] },
  { module: './lastro-ui-state.mjs', owners: [
    { kind: 'function', name: 'lastroUiWindowAppend', protectHost: true },
    { kind: 'function', name: 'lastroBindNestedWindowState', protectHost: true },
    { kind: 'function', name: 'selfSave', protectHost: false },
    { kind: 'function', name: 'StorageFilter', protectHost: false },
    { kind: 'variable', name: 'init_Preferences$1', protectHost: false },
  ] },
  { module: './lastro-store-scroll.mjs', owners: [
    { kind: 'function', name: 'installLastroStoreScroll', protectHost: true },
    { kind: 'variable', name: 'init_NpcStore', protectHost: false },
  ] },
  { module: './lastro-storage-count.mjs', owners: [
    { kind: 'function', name: 'createStorage', protectHost: false },
    { kind: 'variable', name: 'init_StorageFilter', protectHost: false },
    { kind: 'assignment', name: 'StorageFilter.prototype.addItem', region: 'src/UI/Components/Storage/StorageV3/StorageFilter.js' },
    { kind: 'assignment', name: 'StorageFilter.prototype.removeItem', region: 'src/UI/Components/Storage/StorageV3/StorageFilter.js' },
  ] },
  { module: './lastro-basic-info.mjs', owners: [
    { kind: 'variable', name: 'init_BasicInfoV1$1', protectHost: false },
    { kind: 'variable', name: 'init_BasicInfoV1$2', protectHost: false },
    { kind: 'variable', name: 'init_BasicInfoV3$1', protectHost: false },
    { kind: 'variable', name: 'init_BasicInfoV3$2', protectHost: false },
    { kind: 'variable', name: 'init_BasicInfoV4$1', protectHost: false },
    { kind: 'variable', name: 'init_BasicInfoV4$2', protectHost: false },
    { kind: 'variable', name: 'init_BasicInfoV5$1', protectHost: false },
    { kind: 'variable', name: 'init_BasicInfoV5$2', protectHost: false },
  ] },
  { module: './lastro-dialog-typography.mjs', owners: [
    { kind: 'variable', name: 'init_EntityDialog', protectHost: false },
    { kind: 'class', name: 'Dialog', region: 'src/Renderer/Entity/EntityDialog.js' },
  ] },
  { module: './lastro-typography.mjs', owners: [
    { kind: 'variable', name: 'init_Common$1', protectHost: false },
    { kind: 'variable', name: 'init_ChatBox', protectHost: false },
    { kind: 'variable', name: 'init_ChatBox$1', protectHost: false },
    { kind: 'variable', name: 'init_ItemInfo$1', protectHost: false },
    { kind: 'variable', name: 'init_ChatRoomCreate$1', protectHost: false },
    { kind: 'variable', name: 'init_CashShop$2', protectHost: false },
    { kind: 'variable', name: 'init_EntitySignboard$1', protectHost: false },
    { kind: 'variable', name: 'init_LastROTools$1', protectHost: false },
    { kind: 'variable', name: 'init_Storage$3', protectHost: false },
    { kind: 'variable', name: 'init_SkillListV2$1', protectHost: false },
    { kind: 'variable', name: 'init_InventoryV0$1', protectHost: false },
    { kind: 'variable', name: 'init_InventoryV1$1', protectHost: false },
    { kind: 'variable', name: 'init_InventoryV2$1', protectHost: false },
    { kind: 'variable', name: 'init_InventoryV3$1', protectHost: false },
  ] },
  { module: './lastro-navigation-ui.mjs', owners: [
    { kind: 'function', name: 'getNavigationDockPosition', protectHost: true },
    { kind: 'function', name: 'dockLastroNavigation', protectHost: true },
    { kind: 'function', name: 'createMiniMap', protectHost: false },
    { kind: 'variable', name: 'init_Navigation', protectHost: false },
  ] },
  { module: './lastro-npc-dialog-buttons.mjs', owners: [
    { kind: 'function', name: 'installLastroNpcDialogButtonFallback', protectHost: true },
    { kind: 'variable', name: 'init_NpcBox', protectHost: false },
  ] },
  { module: './lastro-mail.mjs', owners: [
    { kind: 'function', name: 'onClickClose$1', protectHost: false },
    { kind: 'function', name: 'onClickSend', protectHost: false },
    { kind: 'variable', name: 'escapeMailText', protectHost: true },
    { kind: 'variable', name: 'init_Rodex$1', protectHost: false },
    { kind: 'variable', name: 'init_Rodex$2', protectHost: false },
    { kind: 'variable', name: 'init_Rodex$3', protectHost: false },
    { kind: 'variable', name: 'init_WriteRodex', protectHost: false },
    { kind: 'variable', name: 'init_WriteRodex$1', protectHost: false },
    { kind: 'variable', name: 'init_WriteRodex$2', protectHost: false },
    { kind: 'variable', name: 'init_ReadRodex$1', protectHost: false },
    { kind: 'variable', name: 'init_ReadRodex$2', protectHost: false },
  ] },
  { module: './lastro-shop-titles.mjs', owners: [
    { kind: 'function', name: 'lastroSetShopTitleVisibility', protectHost: true },
    { kind: 'variable', name: 'init_Map', protectHost: false },
    { kind: 'variable', name: 'init_ProcessCommand', protectHost: false },
    { kind: 'variable', name: 'init_EntityRoom', protectHost: false },
    { kind: 'variable', name: 'init_EntityRoom$2', protectHost: false },
  ] },
  { module: './lastro-map-resource-name.mjs', owners: [
    { kind: 'function', name: 'resolveLastroMapResourceName', protectHost: true },
  ] },
  { module: './lastro-map-load-diagnostic.mjs', owners: [
    { kind: 'function', name: 'describeLastroMapLoadFailure', protectHost: true },
    { kind: 'function', name: 'onMapComplete', protectHost: false },
  ] },
  { module: './lastro-worldmap.mjs', owners: [
    { kind: 'function', name: 'createWorldMapIndex', protectHost: true },
    { kind: 'function', name: 'installLastroWorldMap', protectHost: true },
    { kind: 'variable', name: 'init_WorldMap', protectHost: false },
    { kind: 'variable', name: 'lastroWorldMapActions', protectHost: true },
  ] },
  { module: './lastro-monster-portrait.mjs', owners: [
    { kind: 'function', name: 'createMonsterPortraitLoader', protectHost: true },
  ] },
];
const retiredHostTransforms = ["patchWebAudioPlayback","patchRuntimePreferencesSave","patchRuntimeWorldMap","patchMapLoadFailureRecovery"];
const reusableCoreModules = ['./lastro-server-walk.mjs', './lastro-costume-loop.mjs'];

function parseSource(source, fileName) {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true,
    fileName.endsWith('.d.mts') ? ts.ScriptKind.TS : ts.ScriptKind.JS);
}

function diagnosticsFor(fileName, file) {
  return file.parseDiagnostics.map(diagnostic => {
    const position = file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
    return `${fileName}:${position.line + 1}:${position.character + 1}: ${message}`;
  });
}

function visit(node, callback) {
  callback(node);
  ts.forEachChild(node, child => visit(child, callback));
}

function importedBindings(declaration) {
  const clause = declaration.importClause;
  if (!clause) return [];
  const result = [];
  if (clause.name) result.push({ imported: 'default', local: clause.name.text });
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
    result.push({ imported: '*', local: clause.namedBindings.name.text });
  } else if (clause.namedBindings) {
    for (const element of clause.namedBindings.elements) {
      result.push({ imported: element.propertyName?.text ?? element.name.text, local: element.name.text });
    }
  }
  return result;
}

function topLevelDefinitions(file) {
  const definitions = new Map();
  const add = (name, kind) => definitions.set(name, [...(definitions.get(name) ?? []), kind]);
  for (const statement of file.statements) {
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) {
      add(statement.name.text, ts.isFunctionDeclaration(statement) ? 'function' : 'class');
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) add(declaration.name.text, 'variable');
      }
    } else if (ts.isExpressionStatement(statement)
      && ts.isBinaryExpression(statement.expression)
      && statement.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isIdentifier(statement.expression.left)) {
      add(statement.expression.left.text, 'assignment');
    } else if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        add(element.name.text, 'export');
      }
    }
  }
  return definitions;
}

function topLevelTemplateDefinitions(file) {
  const definitions = new Map();
  const add = (name, kind) => definitions.set(name, [...(definitions.get(name) ?? []), kind]);
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const initializer = declaration.initializer;
      if (!initializer || !ts.isTemplateExpression(initializer)) continue;
      const generated = parseSource(initializer.head.text, 'patcher-prefix.js');
      for (const [name, kinds] of topLevelDefinitions(generated)) {
        for (const kind of kinds) add(name, `template-${kind}`);
      }
    }
  }
  return definitions;
}

function callsInOwner(file, ownerName, localName) {
  const owners = file.statements.filter(statement =>
    ts.isFunctionDeclaration(statement) && statement.name?.text === ownerName);
  if (owners.length !== 1) return { count: 0, ownerCount: owners.length };
  let count = 0;
  visit(owners[0], node => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === localName) count++;
  });
  return { count, ownerCount: owners.length };
}

function containsMigrationToolReference(file) {
  let found;
  visit(file, node => {
    if (found || !ts.isStringLiteralLike(node)) return;
    if (node.text.includes('migrate-runtime-core') || node.text.includes('check-runtime-consolidation')) {
      found = node.text;
    }
  });
  return found;
}

/** Audit permanent bundle ownership and retired build-time transform boundaries. */
function ownerHasLocalBinding(file, ownerName, localName) {
  const owners = file.statements.filter(statement =>
    ts.isFunctionDeclaration(statement) && statement.name?.text === ownerName);
  if (owners.length !== 1) return false;
  let found = false;
  visit(owners[0], node => {
    if (found) return;
    if ((ts.isParameter(node) || ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)
        || ts.isClassDeclaration(node) || ts.isBindingElement(node))
        && ts.isIdentifier(node.name) && node.name.text === localName) found = true;
    if (ts.isCatchClause(node) && node.variableDeclaration?.name && ts.isIdentifier(node.variableDeclaration.name)
        && node.variableDeclaration.name.text === localName) found = true;
  });
  return found;
}

function exactImportCount(file, expected) {
  let count = 0;
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)
        || statement.moduleSpecifier.text !== expected.module) continue;
    for (const binding of importedBindings(statement)) {
      if (binding.imported === expected.imported && binding.local === expected.local) count++;
    }
  }
  return count;
}

function runtimeDefinitionIndex(file) {
  const definitions = new Map();
  visit(file, node => {
    let key;
    if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name) key = `function:${node.name.text}`;
    else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) key = `variable:${node.name.text}`;
    else if (ts.isMethodDeclaration(node)) key = `method:${node.name.getText(file)}`;
    else if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
      const assigned = ts.isBinaryExpression(node.parent) ? node.parent.left.getText(file)
        : ts.isVariableDeclaration(node.parent) ? node.parent.name.getText(file) : undefined;
      key = `class:${node.name?.text ?? assigned}`;
    } else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      key = `assignment:${node.left.getText(file)}`;
    } else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) key = `call:${node.expression.text}`;
    if (key) definitions.set(key, [...(definitions.get(key) ?? []), node]);
  });
  return definitions;
}

function runtimeRegionRanges(file) {
  const ranges = new Map();
  for (const match of file.text.matchAll(/^\/\/#region ([^\r\n]+)\r?\n/gm)) {
    const end = file.text.indexOf('//#endregion', match.index + match[0].length);
    const range = { start: match.index, end };
    ranges.set(match[1], [...(ranges.get(match[1]) ?? []), range]);
  }
  return ranges;
}

// Decoded source fragments, including strings concatenated across literals and
// template tails, may define a factory even without a direct host declaration.
function serializedCodeText(node) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    return node.head.text + node.templateSpans.map(span =>
      (serializedCodeText(span.expression) ?? '__lastro_value__') + span.literal.text).join('');
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = serializedCodeText(node.left), right = serializedCodeText(node.right);
    if (left !== undefined || right !== undefined) return (left ?? '__lastro_value__') + (right ?? '__lastro_value__');
  }
  return undefined;
}

function auditPermanentOwners(vendor, modules, diagnostics) {
  const definitions = runtimeDefinitionIndex(vendor), ranges = runtimeRegionRanges(vendor);
  for (const module of modules) {
    for (const owner of module.owners) {
      const region = owner.region ? ranges.get(owner.region) ?? [] : undefined;
      const matches = (definitions.get(`${owner.kind}:${owner.name}`) ?? []).filter(node => {
        if (region && (region.length !== 1 || node.getStart(vendor) < region[0].start || node.end > region[0].end)) return false;
        if (owner.topLevel && node.parent !== vendor && node.parent?.parent !== vendor) return false;
        return true;
      });
      if (matches.length !== 1) {
        diagnostics.push(`permanent owner ${module.module}#${owner.kind}:${owner.name}: expected exactly one vendor definition; found ${matches.length}`);
      }
    }
  }
}

function canonicalHostModule(specifier, fileName) {
  if (!specifier.startsWith('.') && !specifier.startsWith('file:')) return undefined;
  try {
    const url = new URL(specifier, new URL(fileName, new URL('../', import.meta.url)));
    url.search = ''; url.hash = '';
    return fileURLToPath(url);
  } catch {
    return undefined;
  }
}

function auditHostCoreBoundaries(files, modules, forbiddenTransforms, transforms, diagnostics) {
  const protectedNames = new Set(modules.flatMap(module => module.owners.filter(owner => owner.protectHost).map(owner => owner.name)));
  const forbiddenNames = new Set([...protectedNames, ...forbiddenTransforms]);
  const coreModules = new Set([...modules.map(module => module.module), ...reusableCoreModules,
    ...transforms.map(transform => transform.module)].map(module => canonicalHostModule(module, 'scripts/patch-v2-runtime.mjs')));
  const compiler = ts.createCompilerHost({ allowJs: true, noResolve: true, noLib: true });
  const byName = new Map(files.map(file => [file.fileName, file]));
  compiler.getSourceFile = name => byName.get(name);
  const checker = ts.createProgram([...byName.keys()], { allowJs: true, noResolve: true, noLib: true }, compiler).getTypeChecker();
  for (const file of files) {
    const isCoreModule = specifier => coreModules.has(canonicalHostModule(specifier, file.fileName));
    const bindingContainer = node => {
      let parent = node.parent;
      while (parent && (ts.isObjectBindingPattern(parent) || ts.isArrayBindingPattern(parent) || ts.isBindingElement(parent))) parent = parent.parent;
      return parent;
    };
    const memberName = node => ts.isIdentifier(node) || ts.isStringLiteralLike(node) ? node.text
      : ts.isComputedPropertyName(node) && ts.isStringLiteralLike(node.expression) ? node.expression.text : undefined;
    const importSource = node => {
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (ts.isImportDeclaration(parent)) return parent.moduleSpecifier.text;
      }
      return undefined;
    };
    const isNodeModule = name => name === 'node:module' || name === 'module';
    // Track only Node's module loader and its lexical aliases; ordinary functions
    // receiving a string that happens to name a core module remain legal.
    const loaderValue = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return undefined;
      seen.add(node);
      if (ts.isParenthesizedExpression(node)) return loaderValue(node.expression, seen);
      if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
        const name = memberName(ts.isPropertyAccessExpression(node) ? node.name : node.argumentExpression);
        return name === 'createRequire' && loaderValue(node.expression, seen) === 'node-module' ? 'creator' : undefined;
      }
      if (ts.isCallExpression(node)) {
        const callee = loaderValue(node.expression, seen);
        if (callee === 'creator') return 'loader';
        if (callee === 'loader' && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
            && isNodeModule(node.arguments[0].text)) return 'node-module';
        return undefined;
      }
      if (!ts.isIdentifier(node)) return undefined;
      const declarations = checker.getSymbolAtLocation(node)?.declarations ?? [];
      if (!declarations.length) return node.text === 'require' ? 'loader' : undefined;
      for (const declaration of declarations) {
        if (ts.isNamespaceImport(declaration) && isNodeModule(importSource(declaration))) return 'node-module';
        if (ts.isImportSpecifier(declaration) && isNodeModule(importSource(declaration))
            && (declaration.propertyName?.text ?? declaration.name.text) === 'createRequire') return 'creator';
        if (ts.isVariableDeclaration(declaration)) {
          const value = loaderValue(declaration.initializer, seen);
          if (value) return value;
        }
        if (ts.isBindingElement(declaration)) {
          const container = bindingContainer(declaration);
          if (memberName(declaration.propertyName ?? declaration.name) === 'createRequire'
              && ts.isVariableDeclaration(container) && loaderValue(container.initializer, seen) === 'node-module') return 'creator';
        }
      }
      return undefined;
    };
    const coreValue = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return undefined;
      seen.add(node);
      if (ts.isParenthesizedExpression(node) || ts.isAwaitExpression(node)) return coreValue(node.expression, seen);
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || loaderValue(node.expression) === 'loader')
          && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) return { namespace: true };
      if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
        const receiver = coreValue(node.expression, seen);
        const name = memberName(ts.isPropertyAccessExpression(node) ? node.name : node.argumentExpression);
        return receiver?.namespace && forbiddenNames.has(name) ? { name } : undefined;
      }
      if (!ts.isIdentifier(node)) return undefined;
      const symbol = checker.getSymbolAtLocation(node);
      const declarations = symbol?.declarations ?? [];
      if (!declarations.length) return forbiddenNames.has(node.text) ? { name: node.text } : undefined;
      for (const declaration of declarations) {
        if (ts.isNamespaceImport(declaration)) return { namespace: true };
        if (ts.isImportSpecifier(declaration) && forbiddenNames.has(declaration.propertyName?.text ?? declaration.name.text)) {
          return { name: declaration.propertyName?.text ?? declaration.name.text };
        }
        if (ts.isVariableDeclaration(declaration)) {
          const value = coreValue(declaration.initializer, seen);
          if (value) return value;
        }
        if (ts.isBindingElement(declaration)) {
          const container = bindingContainer(declaration);
          const receiver = ts.isVariableDeclaration(container) ? coreValue(container.initializer, seen) : undefined;
          const name = memberName(declaration.propertyName ?? declaration.name);
          if (receiver?.namespace && forbiddenNames.has(name)) return { name };
        }
      }
      return undefined;
    };
    const definitionDiagnostics = (candidate, serialized) => {
      for (const [key, nodes] of runtimeDefinitionIndex(candidate)) {
        const name = key.slice(key.indexOf(':') + 1);
        if (!forbiddenNames.has(name) || key.startsWith('call:')) continue;
        const prefix = forbiddenTransforms.includes(name) ? `retired host transform ${name}` : `core reinjection ${name}`;
        diagnostics.push(`${prefix}: ${file.fileName} contains ${nodes.length} ${serialized ? 'serialized ' : ''}definition(s)`);
      }
    };
    definitionDiagnostics(file, false);
    visit(file, node => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
        if (isCoreModule(node.moduleSpecifier.text)) diagnostics.push(`core reinjection: ${file.fileName} references permanent/retired module ${node.moduleSpecifier.text}`);
        if (ts.isImportDeclaration(node)) {
          for (const binding of importedBindings(node)) {
            if (forbiddenNames.has(binding.imported)) {
              const prefix = forbiddenTransforms.includes(binding.imported) ? `retired host transform ${binding.imported}` : `core reinjection ${binding.imported}`;
              diagnostics.push(`${prefix}: ${file.fileName} imports binding as ${binding.local}`);
            }
          }
        }
      }
      if (ts.isExportSpecifier(node)) {
        for (const name of [node.name.text, node.propertyName?.text]) {
          if (forbiddenNames.has(name)) diagnostics.push(`${forbiddenTransforms.includes(name) ? 'retired host transform' : 'core reinjection'} ${name}: ${file.fileName} forwarding export`);
        }
      }
      if (ts.isIdentifier(node) && forbiddenNames.has(node.text)) {
        const symbol = checker.getSymbolAtLocation(node);
        const declarations = symbol?.declarations ?? [];
        // A distinct local parameter is not the permanent runtime binding.
        const locallyBound = declarations.length > 0 && declarations.every(declaration =>
          ts.isParameter(declaration) || (ts.isBindingElement(declaration) && ts.isParameter(bindingContainer(declaration))));
        const destructuredMember = declarations.length > 0 && declarations.every(declaration =>
          ts.isBindingElement(declaration) && ts.isVariableDeclaration(bindingContainer(declaration)));
        const isKey = (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)
          || ((ts.isPropertyAssignment(node.parent) || ts.isMethodDeclaration(node.parent)) && node.parent.name === node)
          || (ts.isBindingElement(node.parent) && node.parent.propertyName === node && protectedNames.has(node.text));
        if ((forbiddenTransforms.includes(node.text) || (!locallyBound && !destructuredMember)) && !isKey) {
          const prefix = forbiddenTransforms.includes(node.text) ? `retired host transform ${node.text}` : `core reinjection ${node.text}`;
          diagnostics.push(`${prefix}: ${file.fileName} retains a host binding/reference`);
        }
      }
      const text = serializedCodeText(node);
      if (text !== undefined && [...forbiddenNames].some(name => text.includes(name))) {
        definitionDiagnostics(parseSource(text, 'serialized-core.js'), true);
      }
      if (ts.isCallExpression(node)) {
        const callee = coreValue(node.expression);
        if (forbiddenTransforms.includes(callee?.name)) diagnostics.push(`retired host transform ${callee.name}: ${file.fileName} retains a host call`);
      }
      if (ts.isCallExpression(node) && (ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression))) {
        const name = memberName(ts.isPropertyAccessExpression(node.expression) ? node.expression.name : node.expression.argumentExpression);
        if (name === 'toString') {
          const value = coreValue(node.expression.expression);
          if (value?.name) diagnostics.push(`core reinjection ${value.name}: ${file.fileName} serializes a permanent binding`);
        }
      }
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
          && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0]) && isCoreModule(node.arguments[0].text)) {
        diagnostics.push(`core reinjection: ${file.fileName} dynamically imports ${node.arguments[0].text}`);
      }
      if (ts.isCallExpression(node) && loaderValue(node.expression) === 'loader'
          && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0]) && isCoreModule(node.arguments[0].text)) {
        diagnostics.push(`core reinjection: ${file.fileName} loads permanent/retired module ${node.arguments[0].text}`);
      }
    });
  }
}

export function auditCoreOwnership({
  vendorSource,
  patcherSource,
  prepareSource,
  retiredTransforms: requestedRetirements = [],
  retiredHostExports = [],
  patcherDeclarationsSource,
  permanentModules = [],
  forbiddenHostTransforms = [],
  strictCoreAudit = false,
  relocatedBindings: relocationMappings = relocatedBindings,
  coordinatorBindings: movedCoordinatorBindings = displayCoordinatorBindings,
  forbiddenHostDefinitions: forbiddenDefinitions = relocatedCoordinatorNames,
  strictRelocationAudit = false,
}) {
  const diagnostics = [];
  const transforms = strictCoreAudit ? retiredTransforms : requestedRetirements;
  const modules = strictCoreAudit ? permanentRuntimeModules : permanentModules;
  const hostTransforms = strictCoreAudit ? retiredHostTransforms : forbiddenHostTransforms;
  strictRelocationAudit ||= strictCoreAudit;
  if (strictCoreAudit) {
    relocationMappings = relocatedBindings;
    movedCoordinatorBindings = displayCoordinatorBindings;
    forbiddenDefinitions = relocatedCoordinatorNames;
  }
  const vendor = parseSource(vendorSource, 'vendor/v2/Online.js');
  const patcher = parseSource(patcherSource, 'scripts/patch-v2-runtime.mjs');
  const prepare = parseSource(prepareSource, 'scripts/prepare-runtime.mjs');
  diagnostics.push(...diagnosticsFor('vendor/v2/Online.js', vendor));
  diagnostics.push(...diagnosticsFor('scripts/patch-v2-runtime.mjs', patcher));
  diagnostics.push(...diagnosticsFor('scripts/prepare-runtime.mjs', prepare));
  const declarations = patcherDeclarationsSource === undefined ? undefined
    : parseSource(patcherDeclarationsSource, 'scripts/patch-v2-runtime.d.mts');
  if (declarations) diagnostics.push(...diagnosticsFor(declarations.fileName, declarations));
  if (strictCoreAudit && !declarations) diagnostics.push('final core audit requires patcher declarations source');
  if (modules.length || hostTransforms.length) {
    auditPermanentOwners(vendor, modules, diagnostics);
    auditHostCoreBoundaries([patcher, prepare, ...(declarations ? [declarations] : [])], modules, hostTransforms, transforms, diagnostics);
  }

  const vendorDefinitions = topLevelDefinitions(vendor);
  const patcherDefinitions = topLevelDefinitions(patcher);
  const generatedDefinitions = topLevelTemplateDefinitions(patcher);
  for (const name of retiredHostExports) {
    const permanentCount = vendorDefinitions.get(name)?.length ?? 0;
    if (permanentCount !== 1) {
      diagnostics.push(`permanent definition ${name}: expected exactly one top-level vendor definition; found ${permanentCount}`);
    }
    const hostCount = (patcherDefinitions.get(name)?.length ?? 0) + (generatedDefinitions.get(name)?.length ?? 0);
    if (hostCount > 0) {
      diagnostics.push(`retired host export ${name}: found ${hostCount} top-level patcher definition(s)`);
    }
  }

  const allowedDisplayImports = [
    ...relocationMappings.filter(binding => binding.patcherImport),
    ...movedCoordinatorBindings,
  ];
  for (const statement of patcher.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)
        && statement.moduleSpecifier.text === './lastro-display-localization.mjs') {
      const bindings = importedBindings(statement);
      if (bindings.length === 0) diagnostics.push('retired side-effect import ./lastro-display-localization.mjs remains');
      if (bindings.some(binding => binding.imported === '*')) {
        diagnostics.push('retired namespace import ./lastro-display-localization.mjs remains');
      }
      for (const binding of bindings) {
        const expected = allowedDisplayImports.filter(candidate =>
          candidate.imported === binding.imported && candidate.local === binding.local);
        if (expected.length !== 1 || statement.importClause?.isTypeOnly) {
          diagnostics.push(`unknown display import binding ./lastro-display-localization.mjs#${binding.imported} as ${binding.local}`);
        }
      }
    }
  }

  const retiredModuleSources = new Set(transforms.map(transform => transform.module));
  for (const statement of patcher.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)
        || !retiredModuleSources.has(statement.moduleSpecifier.text)) continue;
    for (const binding of importedBindings(statement)) {
      if (binding.imported === '*') continue;
      if (!transforms.some(transform => transform.module === statement.moduleSpecifier.text
          && transform.imported === binding.imported)) {
        diagnostics.push(`retired import ${statement.moduleSpecifier.text}#${binding.imported} as ${binding.local} remains`);
      }
    }
  }
  for (const expected of allowedDisplayImports) {
    const count = exactImportCount(patcher, expected);
    const matchingRetirement = relocationMappings.find(binding => binding.module === expected.module
      && binding.imported === expected.imported && binding.local === expected.local
      && transforms.some(retired => retired.module === binding.retiredModule
        && retired.imported === binding.retiredExport));
    const callCount = expected.callOwner ? callsInOwner(patcher, expected.callOwner, expected.local) : null;
    const required = strictRelocationAudit || Boolean(matchingRetirement)
      || count > 0 || Boolean(callCount && callCount.count > 0);
    if (required && count !== 1) {
      diagnostics.push(`display import binding ${expected.module}#${expected.imported} as ${expected.local}: expected exactly once; found ${count}`);
    }
    if (expected.callOwner && required) {
      const calls = callCount;
      if (calls.ownerCount !== 1) {
        diagnostics.push(`display call owner ${expected.callOwner}: expected exactly one top-level function; found ${calls.ownerCount}`);
      } else if (calls.count !== 1) {
        diagnostics.push(`display call ${expected.local} in ${expected.callOwner}: expected exactly once; found ${calls.count}`);
      }
      if (ownerHasLocalBinding(patcher, expected.callOwner, expected.local)) {
        diagnostics.push(`display import binding shadowed by owner-local ${expected.local}`);
      }
    }
  }
  for (const name of forbiddenDefinitions) {
    const count = (patcherDefinitions.get(name)?.length ?? 0) + (generatedDefinitions.get(name)?.length ?? 0);
    if (count > 0) diagnostics.push(`moved coordinator ${name}: found ${count} patcher definition(s); forwarding is forbidden`);
  }
  for (const statement of patcher.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    const exports = statement.exportClause && ts.isNamedExports(statement.exportClause)
      ? statement.exportClause.elements.map(element => element.name.text)
      : forbiddenDefinitions;
    for (const name of exports) {
      if (forbiddenDefinitions.includes(name)) diagnostics.push(`moved coordinator ${name}: patcher forwarding export is forbidden`);
    }
  }

  for (const retired of transforms) {
    const expectedModule = retired.module;
    const namedImports = [];
    const namespaceImports = [];
    let sideEffectImport = false;
    for (const statement of patcher.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)
        && statement.moduleSpecifier.text === expectedModule) {
        const bindings = importedBindings(statement);
        if (bindings.length === 0) sideEffectImport = true;
        namespaceImports.push(...bindings.filter(binding => binding.imported === '*'));
        namedImports.push(...bindings.filter(binding => binding.imported === retired.imported));
      }
    }
    if (sideEffectImport) diagnostics.push(`retired side-effect import ${expectedModule} remains`);
    for (const binding of namespaceImports) {
      diagnostics.push(`retired namespace import ${expectedModule}#${retired.imported} through ${binding.local} remains`);
    }
    visit(patcher, node => {
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
        && node.arguments.length >= 1 && ts.isStringLiteralLike(node.arguments[0])
        && node.arguments[0].text === expectedModule) {
        diagnostics.push(`retired dynamic import ${expectedModule} remains`);
      }
    });
    for (const binding of namedImports) {
      diagnostics.push(`retired import ${expectedModule}#${retired.imported} as ${binding.local} remains`);
      if (binding.local !== retired.local) {
        diagnostics.push(`retired import binding changed: expected local ${retired.local}, found ${binding.local}`);
      }
    }

    const mapping = relocationMappings.find(binding => binding.retiredModule === expectedModule
      && binding.retiredExport === retired.imported && binding.local === retired.local && binding.patcherImport);
    const validRelocation = Boolean(mapping && exactImportCount(patcher, mapping) === 1
      && !ownerHasLocalBinding(patcher, retired.callOwner, mapping.local));
    const aliases = new Set([retired.local, ...namedImports.map(binding => binding.local)]);
    for (const alias of aliases) {
      const calls = callsInOwner(patcher, retired.callOwner, alias);
      if (calls.ownerCount !== 1) {
        diagnostics.push(`retired call owner ${retired.callOwner}: expected exactly one top-level function; found ${calls.ownerCount}`);
      } else if (calls.count > 0 && !(validRelocation && alias === mapping.local && namedImports.length === 0)) {
        diagnostics.push(`retired call ${alias} in ${retired.callOwner}: found ${calls.count}`);
      }
    }
  }

  const forbiddenPrepareReference = containsMigrationToolReference(prepare);
  if (forbiddenPrepareReference) {
    diagnostics.push(`prepare references migration tooling: ${forbiddenPrepareReference}`);
  }
  return [...new Set(diagnostics)];
}

function statementOwner(statement, file, index) {
  if (ts.isFunctionDeclaration(statement)) return `function:${statement.name?.text ?? `<anonymous-${index}>`}`;
  if (ts.isClassDeclaration(statement)) return `class:${statement.name?.text ?? `<anonymous-${index}>`}`;
  if (ts.isVariableStatement(statement)) {
    const names = statement.declarationList.declarations.map(declaration => declaration.name.getText(file));
    return `variable:${names.join(',') || index}`;
  }
  if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
    return `import:${statement.moduleSpecifier.text}`;
  }
  if (ts.isExpressionStatement(statement)) {
    const expression = statement.expression;
    if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      return `assignment:${expression.left.getText(file)}`;
    }
    if (ts.isCallExpression(expression)) return `call:${expression.expression.getText(file)}`;
  }
  if (ts.isExportDeclaration(statement)) return 'export-declaration';
  return `statement:${ts.SyntaxKind[statement.kind]}:${index}`;
}

function tokenizeStatement(statement, file, owner) {
  const tokens = [];

  function isTaggedTemplateToken(node) {
    for (let current = node; current && current !== statement; current = current.parent) {
      if (ts.isTemplateExpression(current) || ts.isNoSubstitutionTemplateLiteral(current)) {
        return ts.isTaggedTemplateExpression(current.parent) && current.parent.template === current;
      }
    }
    return false;
  }

  function isDirectiveString(node) {
    // Escapes with the same cooked value can disable a "use strict" directive.
    if (!ts.isStringLiteral(node) || !ts.isExpressionStatement(node.parent)
      || node.parent.expression !== node) return false;
    const container = node.parent.parent;
    if (!ts.isSourceFile(container) && !(ts.isBlock(container)
      && ts.isFunctionLike(container.parent) && container.parent.body === container)) return false;
    for (const current of container.statements) {
      if (!ts.isExpressionStatement(current) || !ts.isStringLiteral(current.expression)) return false;
      if (current === node.parent) return true;
    }
    return false;
  }

  function collect(node) {
    if (node.kind === ts.SyntaxKind.JSDocComment || node.kind === ts.SyntaxKind.EndOfFileToken
      || (typeof ts.isJSDoc === 'function' && ts.isJSDoc(node))) return;
    const children = node.getChildren(file);
    if (children.length) {
      const boundary = ts.SyntaxKind[node.kind] ?? String(node.kind);
      tokens.push({ kind: 'ast-open', value: boundary, owner });
      for (const child of children) collect(child);
      tokens.push({ kind: 'ast-close', value: boundary, owner });
      return;
    }
    if (triviaKinds.has(node.kind)) return;
    const kind = stringKinds.get(node.kind) ?? ts.SyntaxKind[node.kind] ?? String(node.kind);
    const isTemplateToken = node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
      || node.kind === ts.SyntaxKind.TemplateHead
      || node.kind === ts.SyntaxKind.TemplateMiddle
      || node.kind === ts.SyntaxKind.TemplateTail;
    const value = stringKinds.has(node.kind) && !isDirectiveString(node)
      && !(isTemplateToken && isTaggedTemplateToken(node))
      ? node.text
      : node.getText(file);
    tokens.push({ kind, value, owner });
  }

  collect(statement);
  return tokens;
}

function keyedStatements(file) {
  const occurrences = new Map();
  return file.statements.map((statement, index) => {
    const baseOwner = statementOwner(statement, file, index);
    const occurrence = (occurrences.get(baseOwner) ?? 0) + 1;
    occurrences.set(baseOwner, occurrence);
    const owner = occurrence === 1 ? baseOwner : `${baseOwner}#${occurrence}`;
    return { owner, index, statement, tokens: tokenizeStatement(statement, file, owner) };
  });
}

function displayToken(token) {
  if (!token) return '<end>';
  if (token.kind === 'string' || token.kind.startsWith('template-')) {
    const value = token.value.length > 120 ? `${token.value.slice(0, 120)}… (${token.value.length} chars)` : token.value;
    return `${token.kind} ${JSON.stringify(value)}`;
  }
  return `${token.kind} ${JSON.stringify(token.value)}`;
}

function compareOwnerTokens(before, after, owner) {
  let prefix = 0;
  while (prefix < before.length && prefix < after.length
    && before[prefix].kind === after[prefix].kind && before[prefix].value === after[prefix].value) prefix++;
  if (prefix === before.length && prefix === after.length) return null;

  let suffix = 0;
  while (suffix < before.length - prefix && suffix < after.length - prefix
    && before[before.length - 1 - suffix].kind === after[after.length - 1 - suffix].kind
    && before[before.length - 1 - suffix].value === after[after.length - 1 - suffix].value) suffix++;
  const changedBefore = before.slice(prefix, before.length - suffix);
  const changedAfter = after.slice(prefix, after.length - suffix);
  const isSingleLiteral = changedBefore.length === 1 && changedAfter.length === 1
    && (changedBefore[0].kind === 'string' || changedBefore[0].kind.startsWith('template-'))
    && (changedAfter[0].kind === 'string' || changedAfter[0].kind.startsWith('template-'));
  const beforeText = changedBefore.slice(0, 8).map(displayToken).join(', ');
  const afterText = changedAfter.slice(0, 8).map(displayToken).join(', ');
  const beforeTail = changedBefore.length > 8 ? `, … (${changedBefore.length} tokens)` : '';
  const afterTail = changedAfter.length > 8 ? `, … (${changedAfter.length} tokens)` : '';
  return {
    owner,
    kind: isSingleLiteral ? 'literal' : 'token-range',
    detail: `token range ${prefix}: before [${beforeText}${beforeTail}], after [${afterText}${afterTail}]`,
  };
}

/** Strict comparison shared by every stage, including the fixed seven audio owners. */
function compareStrictRuntimeSources(before, after, options) {
  if (!options || !stages.has(options.stage)) {
    throw new Error(`Unknown runtime comparison stage: ${options?.stage ?? '<missing>'}`);
  }
  const beforeFile = parseSource(before, 'before.js');
  const afterFile = parseSource(after, 'after.js');
  const differences = [
    ...diagnosticsFor('before.js', beforeFile).map(detail => ({ owner: 'source:before', kind: 'parse', detail })),
    ...diagnosticsFor('after.js', afterFile).map(detail => ({ owner: 'source:after', kind: 'parse', detail })),
  ];
  if (differences.length) return { equal: false, differences };

  const beforeStatements = keyedStatements(beforeFile);
  const afterStatements = keyedStatements(afterFile);
  const audioOwners = new Set(audioRelocatableOwners);
  const ownerBase = owner => owner.replace(/#\d+$/, '');
  const beforeAudio = beforeStatements.filter(statement => audioOwners.has(ownerBase(statement.owner)));
  const afterAudio = afterStatements.filter(statement => audioOwners.has(ownerBase(statement.owner)));
  const hasAudioOwners = beforeAudio.length > 0 || afterAudio.length > 0;
  let relocatedOwners = [];
  if (hasAudioOwners) {
    for (const owner of audioRelocatableOwners) {
      const beforeMatches = beforeAudio.filter(statement => ownerBase(statement.owner) === owner);
      const afterMatches = afterAudio.filter(statement => ownerBase(statement.owner) === owner);
      if (beforeMatches.length !== 1 || afterMatches.length !== 1) {
        differences.push({
          owner,
          kind: 'audio-owner-count',
          detail: `expected exactly one declaration before and after; found ${beforeMatches.length} before and ${afterMatches.length} after`,
        });
        continue;
      }
      const difference = compareOwnerTokens(beforeMatches[0].tokens, afterMatches[0].tokens, owner);
      if (difference) differences.push(difference);
    }

    const beforeOrder = beforeAudio.map(statement => ownerBase(statement.owner));
    const afterOrder = afterAudio.map(statement => ownerBase(statement.owner));
    if (beforeOrder.length === audioRelocatableOwners.length && afterOrder.length === audioRelocatableOwners.length
      && (beforeOrder.some((owner, index) => owner !== afterOrder[index])
        || beforeOrder.some((owner, index) => owner !== audioRelocatableOwners[index]))) {
      differences.push({
        owner: 'audio initialization order',
        kind: 'audio-relocation-order',
        detail: `expected [${audioRelocatableOwners.join(', ')}]; found before [${beforeOrder.join(', ')}], after [${afterOrder.join(', ')}]`,
      });
    }
    const beforeEffects = beforeAudio.filter(statement => audioSideEffectOwners.includes(ownerBase(statement.owner)));
    const afterEffects = afterAudio.filter(statement => audioSideEffectOwners.includes(ownerBase(statement.owner)));
    if (beforeEffects.map(statement => ownerBase(statement.owner)).join(',') !== audioSideEffectOwners.join(',')
      || afterEffects.map(statement => ownerBase(statement.owner)).join(',') !== audioSideEffectOwners.join(',')) {
      differences.push({
        owner: 'audio effective initializers',
        kind: 'audio-initializer-order',
        detail: 'Web Audio installation must run once before the unlock listener installation',
      });
    }

    const lastImportIndex = afterFile.statements.reduce((last, statement, index) =>
      ts.isImportDeclaration(statement) ? index : last, -1);
    const afterIndexes = afterAudio.map(statement => statement.index);
    if (afterIndexes.length !== audioRelocatableOwners.length
      || afterIndexes[0] !== lastImportIndex + 1
      || afterIndexes.some((index, position) => position > 0 && index !== afterIndexes[position - 1] + 1)) {
      differences.push({
        owner: 'audio declaration placement',
        kind: 'audio-relocation-placement',
        detail: 'audio declarations and their singleton initializers must form one block immediately after the final import',
      });
    }
    const beforeIndexByOwner = new Map(beforeAudio.map(statement => [ownerBase(statement.owner), statement.index]));
    const afterIndexByOwner = new Map(afterAudio.map(statement => [ownerBase(statement.owner), statement.index]));
    relocatedOwners = audioRelocatableOwners.filter(owner => beforeIndexByOwner.get(owner) !== afterIndexByOwner.get(owner));
  }
  const relocatedSet = hasAudioOwners ? audioOwners : new Set();
  const beforeCompared = beforeStatements.filter(statement => !relocatedSet.has(statement.owner.replace(/#\d+$/, '')));
  const afterCompared = afterStatements.filter(statement => !relocatedSet.has(statement.owner.replace(/#\d+$/, '')));
  const beforeByOwner = new Map(beforeCompared.map(statement => [statement.owner, statement]));
  const afterByOwner = new Map(afterCompared.map(statement => [statement.owner, statement]));
  const common = new Set([...beforeByOwner.keys()].filter(owner => afterByOwner.has(owner)));
  const beforeOrder = beforeCompared.map(statement => statement.owner).filter(owner => common.has(owner));
  const afterOrder = afterCompared.map(statement => statement.owner).filter(owner => common.has(owner));
  if (beforeOrder.some((owner, index) => owner !== afterOrder[index])) {
    differences.push({
      owner: 'source-file order',
      kind: 'owner-order',
      detail: `common top-level owners moved: before [${beforeOrder.join(', ')}], after [${afterOrder.join(', ')}]`,
    });
  }

  for (const statement of beforeCompared) {
    if (!afterByOwner.has(statement.owner)) {
      differences.push({ owner: statement.owner, kind: 'removed-owner', detail: 'top-level AST owner is absent after the change' });
      continue;
    }
    const afterStatement = afterByOwner.get(statement.owner);
    const difference = compareOwnerTokens(statement.tokens, afterStatement.tokens, statement.owner);
    if (difference) differences.push(difference);
  }
  for (const statement of afterCompared) {
    if (!beforeByOwner.has(statement.owner)) {
      differences.push({ owner: statement.owner, kind: 'added-owner', detail: 'new top-level AST owner was added' });
    }
  }
  return { equal: differences.length === 0, differences, relocatedOwners };
}

// Spec 6.2/6.3 permits only these fixed WorldMap/action and pure-helper shapes.
// Canonicalization edits individual AST nodes; every remaining token is compared.
function worldMapStructuralProjection(before, after) {
  const oldFile = parseSource(before, 'worldmap-before.js'), newFile = parseSource(after, 'worldmap-after.js');
  const errors = [], deltas = [], oldEdits = [], newEdits = [];
  const reject = detail => { throw new Error(detail); };
  const nodes = (file, predicate) => { const result = []; visit(file, node => { if (predicate(node)) result.push(node); }); return result; };
  const one = (file, predicate, label) => { const found = nodes(file, predicate); if (found.length !== 1) reject(`${label}: expected one, found ${found.length}`); return found[0]; };
  const initializer = file => {
    const declaration = one(file, node => ts.isVariableDeclaration(node) && node.name.getText(file) === 'init_WorldMap', 'init_WorldMap');
    const call = declaration.initializer;
    if (!ts.isCallExpression(call ?? {}) || call.expression.getText(file) !== '__esmMin' || call.arguments.length !== 1
        || !ts.isArrowFunction(call.arguments[0]) || call.arguments[0].parameters.length || call.arguments[0].modifiers?.length
        || !ts.isBlock(call.arguments[0].body)) reject('init_WorldMap callback shape');
    return call.arguments[0].body;
  };
  const hasOldProduct = nodes(oldFile, node => ts.isVariableDeclaration(node) && node.name.getText(oldFile) === 'lastroWorldMapPreflight').length;
  const hasNewActions = nodes(newFile, node => ts.isVariableDeclaration(node) && node.name.getText(newFile) === 'lastroWorldMapActions').length;
  if (!hasOldProduct || !hasNewActions) return { before, after, errors, deltas };
  const tokensEqual = (a, aFile, b, bFile, label) => {
    const difference = compareOwnerTokens(tokenizeStatement(a, aFile, label), tokenizeStatement(b, bFile, label), label);
    if (difference) reject(`${label}: ${difference.detail}`);
  };
  const text = (node, file) => node.getText(file);
  const callStatement = (node, file, name) => ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)
    && node.expression.expression.getText(file) === name && node.expression.arguments.length === 0;
  const constBinding = (node, file, name) => ts.isVariableStatement(node)
    && (node.declarationList.flags & ts.NodeFlags.BlockScoped) === ts.NodeFlags.Const
    && node.declarationList.declarations.length === 1 && node.declarationList.declarations[0].name.getText(file) === name;
  const installerCall = (node, file) => {
    const call = ts.isExpressionStatement(node) && node.expression;
    if (!ts.isCallExpression(call ?? {}) || !ts.isParenthesizedExpression(call.expression)
        || !ts.isFunctionExpression(call.expression.expression) || call.expression.expression.name?.text !== 'installLastroWorldMap'
        || call.arguments.length !== 4 || call.arguments[0].getText(file) !== 'WorldMap'
        || !ts.isObjectLiteralExpression(call.arguments[1]) || !ts.isFunctionExpression(call.arguments[3])
        || call.arguments[3].name?.text !== 'createWorldMapIndex') reject('installer owner/arguments');
    return call;
  };
  const apply = (source, edits) => { for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end); return source; };
  try {
    if (oldFile.parseDiagnostics.length || newFile.parseDiagnostics.length) reject('parse diagnostics');
    const oldBody = initializer(oldFile), newBody = initializer(newFile);
    const a = oldBody.statements, b = newBody.statements;
    const oldInits = ['init_DBManager', 'init_Client', 'init_UIManager', 'init_GUIComponent', 'init_MonsterTable', 'init_NetworkManager', 'init_PacketStructure', 'init_SessionStorage', 'init_MapRenderer', 'init_Navigation', 'init_Thread', 'init_Configs'];
    if (a.length !== 20 || b.length !== 22 || oldInits.some((name, i) => !callStatement(a[i], oldFile, name))
        || oldInits.some((name, i) => !callStatement(b[i], newFile, name))) reject('fixed initializer count/order');
    if (!constBinding(a[12], oldFile, 'lastroWorldMapPreflight') || !constBinding(a[13], oldFile, 'lastroWorldMapTeleport')
        || !constBinding(b[14], newFile, 'lastroWorldMapPreflight') || !constBinding(b[15], newFile, 'lastroWorldMapTeleport')
        || !constBinding(b[13], newFile, 'lastroWorldMapActions')) reject('product/action const owners');
    const actions = b[13].declarationList.declarations[0].initializer;
    if (!ts.isObjectLiteralExpression(actions ?? {}) || actions.properties.length) reject('actions must be an empty object');
    const marker = '/* lastro-worldmap-product-actions */';
    if (after.split(marker).length !== 2 || after.slice(b[17].end, b[18].getStart(newFile)).trim() !== marker) reject('unique action marker placement');
    const oldInstaller = installerCall(a[17], oldFile), newInstaller = installerCall(b[19], newFile);
    const oldProps = oldInstaller.arguments[1].properties, newProps = newInstaller.arguments[1].properties;
    const coreProps = ['DB', 'Client', 'monsterPortrait', 'itemTable', 'currentMap', 'accountId', 'loadData'];
    const actionProps = ['navigate', 'teleport', 'cancelTeleport'];
    const assignment = ts.isExpressionStatement(b[17]) && b[17].expression;
    if (oldProps.length !== 10 || !oldProps.hasTrailingComma || newProps.length !== 8 || newProps.hasTrailingComma
        || coreProps.some((name, i) => oldProps[i].name?.getText(oldFile) !== name || newProps[i].name?.getText(newFile) !== name)
        || !ts.isSpreadAssignment(newProps[7]) || newProps[7].expression.getText(newFile) !== 'lastroWorldMapActions'
        || !ts.isCallExpression(assignment ?? {}) || assignment.expression.getText(newFile) !== 'Object.assign'
        || assignment.arguments.length !== 2 || assignment.arguments[0].getText(newFile) !== 'lastroWorldMapActions'
        || !ts.isObjectLiteralExpression(assignment.arguments[1]) || assignment.arguments[1].properties.length !== 3 || !assignment.arguments[1].properties.hasTrailingComma
        || actionProps.some((name, i) => oldProps[i + 7].name?.getText(oldFile) !== name || assignment.arguments[1].properties[i].name?.getText(newFile) !== name)) reject('exact three action members and core deps');
    const gui = ts.isExpressionStatement(b[12]) && b[12].expression;
    if (!ts.isBinaryExpression(gui ?? {}) || gui.left.getText(newFile) !== 'WorldMap' || gui.operatorToken.kind !== ts.SyntaxKind.EqualsToken
        || !ts.isNewExpression(gui.right) || gui.right.expression.getText(newFile) !== 'GUIComponent'
        || gui.right.arguments?.length !== 2 || !ts.isStringLiteral(gui.right.arguments[0]) || gui.right.arguments[0].text !== 'WorldMap'
        || !ts.isStringLiteral(gui.right.arguments[1])) reject('unique WorldMap GUI constructor');
    for (const [i, j] of [[14, 12], [15, 16], [16, 18], [18, 20], [19, 21]]) tokensEqual(a[i], oldFile, b[j], newFile, `WorldMap statement ${i}`);
    if (text(a[15], oldFile) !== 'WorldMap._lastroTeleport = lastroWorldMapTeleport;'
        || text(a[18], oldFile) !== 'WorldMap.mouseMode = GUIComponent.MouseMode.STOP;'
        || text(a[19], oldFile) !== 'WorldMap_default = UIManager.addComponent(WorldMap);') reject('attachment/registration shape');
    for (const name of ['createLastroTeleportPreflight', 'createLastroWorldMapTeleport', 'installLastroWorldMap', 'createWorldMapIndex', 'createMonsterPortraitLoader']) {
      const predicate = node => ts.isFunctionExpression(node) && node.name?.text === name && node.getStart() >= oldBody.getStart() && node.end <= oldBody.end;
      one(oldFile, predicate, `old factory ${name}`);
      one(newFile, node => ts.isFunctionExpression(node) && node.name?.text === name && node.getStart() >= newBody.getStart() && node.end <= newBody.end, `new factory ${name}`);
    }
    const resolver = one(newFile, node => ts.isFunctionDeclaration(node) && node.name?.text === 'resolveLastroMapResourceName', 'permanent resolver');
    const diagnosticOld = one(oldFile, node => ts.isFunctionDeclaration(node) && node.name?.text === 'describeLastroMapLoadFailure', 'old diagnostic');
    const diagnosticNew = one(newFile, node => ts.isFunctionDeclaration(node) && node.name?.text === 'describeLastroMapLoadFailure', 'permanent diagnostic');
    const mapComplete = one(newFile, node => ts.isFunctionDeclaration(node) && node.name?.text === 'onMapComplete', 'map completion');
    if (resolver.parent !== newFile || diagnosticNew.parent !== newFile || diagnosticOld !== oldFile.statements[3]
        || oldFile.statements.slice(0, 3).some(node => !ts.isImportDeclaration(node) || node.moduleSpecifier.text !== './lastro-trusted-dom.mjs')
        || newFile.statements.indexOf(diagnosticNew) !== newFile.statements.indexOf(resolver) + 1
        || newFile.statements.indexOf(mapComplete) !== newFile.statements.indexOf(diagnosticNew) + 1
        || resolver.modifiers?.length || resolver.asteriskToken || diagnosticNew.modifiers?.length || diagnosticNew.asteriskToken) reject('pure helper declaration placement/shape');
    tokensEqual(diagnosticOld, oldFile, diagnosticNew, newFile, 'diagnostic body');
    const oldResolverCalls = nodes(oldFile, node => ts.isCallExpression(node) && ts.isParenthesizedExpression(node.expression)
      && ts.isFunctionExpression(node.expression.expression) && node.expression.expression.name?.text === 'resolveLastroMapResourceName');
    const newResolverCalls = nodes(newFile, node => ts.isCallExpression(node) && node.expression.getText(newFile) === 'resolveLastroMapResourceName');
    const enclosingOwner = (node, file) => { for (let current = node.parent; current; current = current.parent) {
      if (ts.isVariableDeclaration(current) && ['lastroWorldMapPreflight', 'lastroNpcMapPreflight', 'lastroAchievementMapPreflight', 'lastroRoutePreflight'].includes(current.name.getText(file))) return current.name.getText(file);
    } return ''; };
    const expectedOwners = ['lastroWorldMapPreflight', 'lastroNpcMapPreflight', 'lastroAchievementMapPreflight', 'lastroRoutePreflight'];
    if (oldResolverCalls.length !== 4 || newResolverCalls.length !== 4
        || oldResolverCalls.map(node => enclosingOwner(node, oldFile)).sort().join(',') !== [...expectedOwners].sort().join(',')
        || newResolverCalls.map(node => enclosingOwner(node, newFile)).sort().join(',') !== [...expectedOwners].sort().join(',')) reject('exact four preflight resolver consumers');
    // A local binding can be identical in both sources while changing the new
    // identifier call relative to the old inline function. Resolve lexical
    // symbols, including parameters and destructuring/catch/block bindings.
    const bindingOptions = { allowJs: true, noLib: true, noResolve: true };
    const bindingHost = {
      ...ts.createCompilerHost(bindingOptions),
      getSourceFile: name => name === newFile.fileName ? newFile : undefined,
      fileExists: name => name === newFile.fileName,
      readFile: name => name === newFile.fileName ? after : undefined,
    };
    const bindingChecker = ts.createProgram([newFile.fileName], bindingOptions, bindingHost).getTypeChecker();
    for (const call of newResolverCalls) {
      const bindings = bindingChecker.getSymbolAtLocation(call.expression)?.getDeclarations();
      if (bindings?.length !== 1 || bindings[0] !== resolver) reject('permanent resolver callee is shadowed or unresolved');
    }
    const resolverText = text(resolver, newFile);
    for (const call of oldResolverCalls) {
      const fn = call.expression.expression;
      if (call.arguments.length !== 2 || call.arguments[0].getText(oldFile) !== 'filename' || call.arguments[1].getText(oldFile) !== 'DB.mapalias'
          || !ts.isVariableDeclaration(call.parent) || call.parent.name.getText(oldFile) !== 'resolvedFilename') reject('resolver invocation arguments/owner');
      // Function declarations and expressions have distinct AST wrappers; compare
      // equivalent expressions so parameters, body and literals remain exact.
      const reference = parseSource(`const resolver = (${resolverText});`, 'resolver-reference.js');
      tokensEqual(fn, oldFile, reference.statements[0].declarationList.declarations[0].initializer.expression, reference, 'resolver body');
      oldEdits.push({ start: call.expression.getStart(oldFile), end: call.expression.end, text: 'resolveLastroMapResourceName' });
    }
    for (const call of newResolverCalls) if (call.arguments.length !== 2 || call.arguments[0].getText(newFile) !== 'filename'
        || call.arguments[1].getText(newFile) !== 'DB.mapalias' || !ts.isVariableDeclaration(call.parent)
        || call.parent.name.getText(newFile) !== 'resolvedFilename') reject('permanent resolver invocation drift');
    // Normalize the old WorldMap body into the reviewed new statement order.
    // Copy old members verbatim; the subsequent strict pass checks all new bodies.
    const oldDeps = oldInstaller.arguments[1];
    const depsText = '{' + oldProps.slice(0, 7).map(node => text(node, oldFile)).join(',') + ',...lastroWorldMapActions}';
    const installerText = before.slice(oldInstaller.getStart(oldFile), oldDeps.getStart(oldFile)) + depsText + before.slice(oldDeps.end, oldInstaller.end) + ';';
    const resolverInBody = oldResolverCalls.find(call => enclosingOwner(call, oldFile) === 'lastroWorldMapPreflight');
    const preflightText = text(a[12], oldFile).replace(text(resolverInBody.expression, oldFile), 'resolveLastroMapResourceName');
    const normalizedBody = '{' + [...oldInits.map(name => name + '();'), text(a[14], oldFile), 'const lastroWorldMapActions = {};',
      preflightText, text(a[13], oldFile), text(a[15], oldFile),
      'Object.assign(lastroWorldMapActions, {' + oldProps.slice(7).map(node => text(node, oldFile)).join(',') + ',});',
      text(a[16], oldFile), installerText, text(a[18], oldFile), text(a[19], oldFile)].join('\n') + '}';
    oldEdits.splice(oldEdits.findIndex(edit => edit.start === resolverInBody.expression.getStart(oldFile)), 1);
    oldEdits.push({ start: oldBody.getStart(oldFile), end: oldBody.end, text: normalizedBody }, { start: diagnosticOld.getStart(oldFile), end: diagnosticOld.end, text: '' });
    newEdits.push({ start: resolver.getStart(newFile), end: resolver.end, text: '' }, { start: diagnosticNew.getStart(newFile), end: diagnosticNew.end, text: '' });
    deltas.push('WorldMap: twelve client initializers retain exact order; GUI precedes pure product factory construction',
      'WorldMap: empty const actions object, unique marker, exact three callbacks assigned once and spread into installer deps',
      'resolver: four token-identical inline preflight helpers replaced by one pure declaration and exact filename/DB.mapalias calls',
      'diagnostic: token-identical pure declaration relocated immediately before onMapComplete after resolver');
    return { before: apply(before, oldEdits), after: apply(after, newEdits), errors, deltas };
  } catch (error) {
    errors.push({ owner: 'WorldMap structural contract', kind: 'worldmap-shape', detail: error.message });
    return { before, after, errors, deltas: [] };
  }
}

export function compareRuntimeSources(before, after, options) {
  if (!['worldmap', 'final'].includes(options?.stage)) return compareStrictRuntimeSources(before, after, options);
  const projection = worldMapStructuralProjection(before, after);
  const result = compareStrictRuntimeSources(projection.before, projection.after, options);
  result.differences.unshift(...projection.errors);
  result.equal = result.differences.length === 0;
  if (projection.deltas.length) result.structuralDeltas = projection.deltas;
  return result;
}

function parseArguments(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--check-final') {
      if (values.has(flag)) throw new Error('Duplicate --check-final');
      values.set(flag, true);
      continue;
    }
    if (!['--baseline', '--candidate', '--stage'].includes(flag)) throw new Error(`Unknown or unsupported flag: ${flag}`);
    const value = args[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (values.has(flag)) throw new Error(`Duplicate ${flag}`);
    values.set(flag, value);
    index++;
  }
  return values;
}

async function cli(args) {
  const values = parseArguments(args);
  if (values.has('--check-final')) {
    if (values.size !== 1) throw new Error('--check-final cannot be combined with comparison flags');
    const [vendorSource, patcherSource, prepareSource, patcherDeclarationsSource] = await Promise.all([
      readFile(path.join(repo, 'vendor/v2/Online.js'), 'utf8'),
      readFile(path.join(repo, 'scripts/patch-v2-runtime.mjs'), 'utf8'),
      readFile(path.join(repo, 'scripts/prepare-runtime.mjs'), 'utf8'),
      readFile(path.join(repo, 'scripts/patch-v2-runtime.d.mts'), 'utf8'),
    ]);
    const diagnostics = auditCoreOwnership({
      vendorSource, patcherSource, prepareSource, patcherDeclarationsSource,
      strictCoreAudit: true,
      relocatedBindings,
      coordinatorBindings: displayCoordinatorBindings,
      forbiddenHostDefinitions: [...relocatedCoordinatorNames, 'patchRuntimeWorldMap', 'patchMapLoadFailureRecovery'],
      strictRelocationAudit: true,
    });
    for (const module of new Set(retiredTransforms.map(transform => transform.module))) {
      const modulePath = path.resolve(repo, 'scripts', module);
      const scriptsRoot = `${path.resolve(repo, 'scripts')}${path.sep}`;
      if (!modulePath.startsWith(scriptsRoot)) throw new Error(`Retired module escaped scripts/: ${module}`);
      try {
        await access(modulePath);
        diagnostics.push(`retired module remains: ${path.relative(repo, modulePath)}`);
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    }
    process.stdout.write(`${JSON.stringify({
      ok: diagnostics.length === 0,
      retiredTransforms: retiredTransforms.length,
      relocatedBindings: relocatedBindings.length,
      permanentModules: permanentRuntimeModules.length,
      permanentOwners: permanentRuntimeModules.reduce((count, module) => count + module.owners.length, 0),
      retiredHostTransforms: retiredHostTransforms.length,
      diagnostics,
    }, null, 2)}\n`);
    if (diagnostics.length) process.exitCode = 1;
    return;
  }

  const baselinePath = values.get('--baseline');
  const candidatePath = values.get('--candidate');
  const stage = values.get('--stage');
  if (values.size !== 3 || typeof baselinePath !== 'string' || typeof candidatePath !== 'string' || typeof stage !== 'string') {
    throw new Error('Usage: --baseline <absolute-file> --candidate <absolute-file> --stage <stage> | --check-final');
  }
  if (!path.isAbsolute(baselinePath) || !path.isAbsolute(candidatePath)) {
    throw new Error('--baseline and --candidate must be absolute paths');
  }
  const [before, after] = await Promise.all([
    readFile(baselinePath, 'utf8'),
    readFile(candidatePath, 'utf8'),
  ]);
  const comparison = compareRuntimeSources(before, after, { stage });
  process.stdout.write(`${JSON.stringify({ stage, ...comparison }, null, 2)}\n`);
  if (!comparison.equal) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli(process.argv.slice(2)).catch(error => {
    process.stderr.write(`${error?.message ?? error}\n`);
    process.exitCode = 1;
  });
}
