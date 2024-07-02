let circularMaskTexture = null;

function countEffects(token) {
  if (!token) {
    return 0;
  }
  let numEffects = token.document.effects?.length || 0;
  token.actor?.temporaryEffects?.forEach((actorEffect) => {
    if (!actorEffect.getFlag("core", "overlay")) {
      numEffects++;
    }
  });
  return numEffects;
}

function sortIcons(e1, e2) {
  if (e1.position.x === e2.position.x) {
    return e1.position.y - e2.position.y;
  }
  return e1.position.x - e2.position.x;
}

function updateIconSize(effectIcon, size) {
  effectIcon.width = size;
  effectIcon.height = size;
}

const thetaToXY = new Map();
const sizeAndIndexToOffsets = new Map();

function polar_to_cartesian(theta) {
  if (!thetaToXY.has(theta)) {
    thetaToXY.set(theta, {
      x: Math.cos(theta),
      y: Math.sin(theta),
    });
  }
  return thetaToXY.get(theta);
};

function calculateOffsets(i, actorSize) {
  let key = JSON.stringify({size: actorSize, index: i});
  if (!sizeAndIndexToOffsets.has(key)) {
    const rowMax = sizeToRowMax(actorSize);
    const row = Math.floor(i / rowMax);
    const ratio = i / rowMax;
    const gapOffset = (1 / rowMax) * (1 + row % 2) * Math.PI;
    const initialRotation = (0.5 + (1 / rowMax) * Math.PI) * Math.PI;
    const theta = ratio * 2 * Math.PI + initialRotation + gapOffset
    const offset = sizeToOffset(actorSize) + row * sizeToRowOffset(actorSize);
    sizeAndIndexToOffsets.set(key, {
      offset, theta
    })
  }
  return sizeAndIndexToOffsets.get(key);
}

function updateIconPosition(effectIcon, i, token) {
  const actorSize = token?.actor?.size;
  const { offset, theta } = calculateOffsets(i, actorSize);
  const gridSize = token?.scene?.grid?.size ?? 100;
  const tokenTileFactor = token?.document?.width ?? 1;
  const { x, y } = polar_to_cartesian(theta);
    // debugger;
  effectIcon.position.x = ((x * offset + 1) / 2) * tokenTileFactor * gridSize;
  effectIcon.position.y = ((-1 * y * offset + 1) / 2) * tokenTileFactor * gridSize;
}

// Nudge icons to be on the token ring or slightly outside
function sizeToOffset(size) {
  if (size == "tiny") {
    return 1.4;
  } else if (size == "sm") {
    return 1.0;
  } else if (size == "med") {
    return 1.2;
  } else if (size == "lg") {
    return 0.925;
  } else if (size == "huge") {
    return 0.925;
  } else if (size == "grg") {
    return 0.925;
  }
  return 1.0;
}

function sizeToRowMax(size) {
  if (size == "tiny") {
    return 10;
  } else if (size == "sm") {
    return 14;
  } else if (size == "med") {
    return 16;
  } else if (size == "lg") {
    return 20;
  } else if (size == "huge") {
    return 24;
  } else if (size == "grg") {
    return 28;
  }
  return 20;
}

function sizeToRowOffset(size) {
  if (size == "tiny") {
    return 0.6;
  } else if (size == "sm") {
    return 0.3;
  } else if (size == "med") {
    return 0.3;
  } else if (size == "lg") {
    return 0.1;
  } else if (size == "huge") {
    return 0.1;
  } else if (size == "grg") {
    return 0.1;
  }
  return 1.0;
}

function sizeToIconScale(size) {
  if (size == "tiny") {
    return 1.4;
  } else if (size == "sm") {
    return 1.4;
  } else if (size == "med") {
    return 1.4;
  } else if (size == "lg") {
    return 1.25;
  } else if (size == "huge") {
    return 1.55;
  } else if (size == "grg") {
    return 2.2;
  }
  return 1.0;
}

function drawBG(effectIcon, background, gridScale) {
  const r = effectIcon.width / 2;
  const isDorakoUiActive = game.modules.get("pf2e-dorako-ui")?.active;
  const appTheme = isDorakoUiActive ? game.settings.get("pf2e-dorako-ui", "theme.app-theme") : false;
  if (appTheme && appTheme.includes("foundry2")) {
    background.lineStyle((1 * gridScale) / 2, 0x302831, 1, 0);
    background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
    background.beginFill(0x0b0a13);
    background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
    background.endFill();
    return;
  } else if (appTheme && appTheme.includes("crb")) {
    background.lineStyle((1 * gridScale) / 2, 0x956d58, 1, 1);
    background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
    background.lineStyle((1 * gridScale) / 2, 0xe9d7a1, 1, 0);
    background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
    background.beginFill(0x956d58);
    background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
    background.endFill();
    return;
  } else if (appTheme && appTheme.includes("bg3")) {
    background.lineStyle((1 * gridScale) / 2, 0x9a8860, 1, 1);
    background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
    background.lineStyle((1 * gridScale) / 2, 0xd3b87c, 1, 0);
    background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
    background.beginFill(0x000000);
    background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
    background.endFill();
    return;
  }
  // background.lineStyle((1 * gridScale) / 2, 0x222222, 1, 1);
  // background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
  background.lineStyle((1 * gridScale) / 2, 0x444444, 1, 0);
  background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
  background.beginFill(0x222222);
  background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1 * gridScale);
  background.endFill();
}

function updateEffectScales(token) {
  // if (token?.actor?.size == "sm") return;
  const numEffects = countEffects(token);
  if (numEffects > 0 && token.effects.children.length > 0) {
    const background = token.effects.children[0];
    if (!(background instanceof PIXI.Graphics)) return;

    background.clear();

    // Exclude the background and overlay
    const effectIcons = token.effects.children.slice(1, 1 + numEffects);
    const tokenSize = token?.actor?.size;

    const gridSize = token?.scene?.grid?.size ?? 100;
    // Reposition and scale them
    effectIcons.forEach((effectIcon, i) => {
      if (!(effectIcon instanceof PIXI.Sprite)) return;

      effectIcon.anchor.set(0.5);

      const iconScale = sizeToIconScale(tokenSize);
      const gridScale = gridSize / 100;
      const scaledSize = 12 * iconScale * gridScale;
      updateIconSize(effectIcon, scaledSize);
      updateIconPosition(effectIcon, i, token);
      drawBG(effectIcon, background, gridScale);
    });
  }
}

Hooks.once("ready", () => {
  const enabled = game.settings.get("pf2e-dorako-ux", "moving.adjust-token-effects-hud");
  if (!enabled) return;

  const origRefreshEffects = Token.prototype._refreshEffects;
  Token.prototype._refreshEffects = function (...args) {
    // const enabled = game.settings.get("pf2e-dorako-ux", "ux.adjust-token-effects-hud");
    // if (!enabled) {
    //   origRefreshEffects.apply(this, args);
    //   return;
    // }
    if (this) {
      origRefreshEffects.apply(this, args);
      updateEffectScales(this);
    }
  };

  const origDrawEffect = Token.prototype._drawEffect;
  const effectTextureCache = new Map();
  Token.prototype._drawEffect = async function (...args) {
    if (!this) {
      return;
    }
    const src = args[0];
    if (!src) return;

    let fallbackEffectIcon = "icons/svg/hazard.svg";
    const effectTextureCacheKey = src || fallbackEffectIcon;
    let effectTexture = effectTextureCache.get(effectTextureCacheKey);
    let icon;
    if (effectTexture) {
      icon = new PIXI.Sprite(effectTexture);
    } else {
      let tex = await loadTexture(src, { fallback: fallbackEffectIcon });
      icon = new PIXI.Sprite(tex);

      if (game.system.id === "pf2e" && src == game.settings.get("pf2e", "deathIcon")) {
        return this.effects.addChild(icon);
      }
      const minDimension = Math.min(icon.width, icon.height);

      // Use the blurred pre-made texture and create a new mask sprite for the specific icon
      const myMask = new PIXI.Graphics().beginFill(0xffffff).drawCircle(55, 55, 55).endFill();
      myMask.width = minDimension;
      myMask.height = minDimension;
      // myMask.x = -icon.width / 2
      // myMask.y = -icon.height / 2

      icon.mask = myMask;
      icon.addChild(myMask);
      effectTexture = PIXI.RenderTexture.create({
        width: minDimension,
        height: minDimension,
      });
      canvas.app.renderer.render(icon, { renderTexture: effectTexture });
      effectTextureCache.set(effectTextureCacheKey, effectTexture);
      icon = new PIXI.Sprite(effectTexture);
    }

    return this.effects.addChild(icon);
  };
});
