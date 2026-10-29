export function installHalloweenWorldRuntime(deps) {
  const hauntedMobIds = new Set([1061, 1102, 1117, 1120, 1179, 1192, 1291, 1379]);
  const ghostMobId = 1120;
  const batMobId = 1111;
  const ghostAttachmentId = 'lastro-halloween-ghost';
  const batAttachmentId = 'lastro-halloween-bat';
  let currentMap = '';
  let baseBgm = '01.mp3';
  let lastBgm = '';
  let nextBatTimer;
  let batCleanupTimer;
  let batEntity;
  let batSequence = 0;
  let destroyed = false;

  const enabled = () => !destroyed && deps.isActive() === true;
  const mapName = () => String(deps.getMap() || '').replace(/\.(?:gat|rsw)$/i, '').toLowerCase();
  const isMonster = entity => entity?.objecttype === deps.Entity.TYPE_MOB;
  const spritePath = id => deps.getBodyPath(id);

  function setGhost(entity, show) {
    const attachments = entity?.attachments;
    if (!attachments) return;
    if (!show) {
      attachments.remove(ghostAttachmentId);
      return;
    }
    if (!hauntedMobIds.has(Number(entity.job ?? entity._job))
        || attachments.list?.some(item => item.uid === ghostAttachmentId)) return;
    const completeFile = spritePath(ghostMobId);
    if (!completeFile) return;
    attachments.add({
      uid: ghostAttachmentId,
      completeFile,
      repeat: true,
      duration: 0,
      opacity: 0.72,
      xOffset: 12,
      yOffset: -14,
      ignoreShadow: true,
      stackable: false,
    });
  }

  function syncMonsters() {
    deps.EntityManager.forEach(entity => {
      if (!isMonster(entity)) return;
      setGhost(entity, enabled());
    });
  }

  function removeBat() {
    if (!batEntity) return;
    batEntity.attachments?.remove(batAttachmentId);
    deps.EntityManager.remove(batEntity.GID);
    batEntity = null;
  }

  function stopBat() {
    if (nextBatTimer !== undefined) deps.window.clearTimeout(nextBatTimer);
    if (batCleanupTimer !== undefined) deps.window.clearTimeout(batCleanupTimer);
    nextBatTimer = undefined;
    batCleanupTimer = undefined;
    removeBat();
  }

  function spawnBat() {
    const player = deps.getPlayer();
    const completeFile = spritePath(batMobId);
    if (!player?.position || !completeFile || !enabled() || currentMap !== 'prontera') return false;

    const entity = new deps.Entity();
    const startX = player.position[0] - 8;
    const startY = player.position[1] - 4;
    entity.GID = `lastro-halloween-bat-${++batSequence}`;
    entity.objecttype = deps.Entity.TYPE_EFFECT;
    entity.position = [startX, startY, deps.getGroundHeight(startX, startY) + 4];
    entity.direction = 0;
    entity.hideShadow = true;
    entity.animations.add(elapsed => {
      const progress = Math.min(1, Math.max(0, elapsed / 6500));
      entity.position[0] = startX + progress * 16;
      entity.position[1] = startY + Math.sin(progress * Math.PI * 2) * 2;
      entity.position[2] = deps.getGroundHeight(entity.position[0], entity.position[1]) + 4;
      return progress === 1;
    });
    entity.attachments.add({
      uid: batAttachmentId,
      completeFile,
      repeat: true,
      duration: 0,
      ignoreShadow: true,
      stackable: false,
    });
    deps.EntityManager.add(entity);
    batEntity = entity;
    batCleanupTimer = deps.window.setTimeout(() => {
      batCleanupTimer = undefined;
      removeBat();
    }, 7000);
    return true;
  }

  function scheduleBat(delay = 1200) {
    if (nextBatTimer !== undefined || !enabled() || currentMap !== 'prontera') return;
    nextBatTimer = deps.window.setTimeout(() => {
      nextBatTimer = undefined;
      if (!spawnBat()) {
        scheduleBat(3000);
        return;
      }
      scheduleBat(18000 + Math.floor(Math.random() * 10000));
    }, delay);
  }

  function syncMusic() {
    if (!currentMap) return;
    const filename = enabled() && currentMap === 'prontera' ? '84.mp3' : baseBgm;
    if (filename === lastBgm) return;
    lastBgm = filename;
    deps.playBgm(filename);
  }

  function sync() {
    if (destroyed) return;
    syncMusic();
    syncMonsters();
    if (enabled() && currentMap === 'prontera') scheduleBat();
    else stopBat();
  }

  const onHolidayChange = () => sync();
  deps.window.addEventListener('lastro-halloween-change', onHolidayChange);

  const originalAdd = deps.EntityManager.add;
  const wrappedAdd = function (entity, ...args) {
    const result = originalAdd.call(this, entity, ...args);
    const added = result || entity;
    if (isMonster(added)) setGhost(added, enabled());
    return result;
  };
  deps.EntityManager.add = wrappedAdd;

  return {
    onMapLoaded(mapInfo) {
      currentMap = mapName();
      baseBgm = typeof mapInfo?.mp3 === 'string' && mapInfo.mp3 ? mapInfo.mp3 : '01.mp3';
      lastBgm = '';
      sync();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      deps.window.removeEventListener('lastro-halloween-change', onHolidayChange);
      if (deps.EntityManager.add === wrappedAdd) deps.EntityManager.add = originalAdd;
      stopBat();
      syncMonsters();
      if (currentMap) deps.playBgm(baseBgm);
    },
  };
}
