// examples/demo/ui/statusPanel.js
export const statusPanel = (needs, getAsset, { x = 4, y = 4, spacing = 10 } = {}) => {
  const { frameImage, blockImage, hungerIconImage, energyIconImage, funIconImage } =
    getAsset("petStatusUi");

  const bars = [
    { icon: hungerIconImage, get: () => needs.hunger, yOffset: 0 },
    { icon: energyIconImage, get: () => needs.energy, yOffset: spacing },
    { icon: funIconImage, get: () => needs.happiness, yOffset: spacing * 2 },
  ];

  const innerX = 1;
  const innerY = Math.floor((frameImage.height - blockImage.height) / 2);

  const blockW = blockImage.width;
  const blockH = blockImage.height;
  const blockStep = blockW;

  const maxBlocks = needs.maxBlocks;
  const gap = 1;

  const drawBar = (ctx, scale, { icon, get, yOffset }) => {
    const uiScale = Math.max(1, Math.round(scale * 0.8));
    const px = Math.round(x * uiScale);
    const py = Math.round((y + yOffset) * uiScale);

    ctx.drawImage(icon, px, py, icon.width * uiScale, icon.height * uiScale);

    const fx = Math.round(px + (icon.width + gap) * uiScale);
    const fy = py;
    ctx.drawImage(frameImage, fx, fy, frameImage.width * uiScale, frameImage.height * uiScale);

    const filled = Math.max(0, Math.min(maxBlocks, Math.round(get())));
    for (let i = 0; i < filled; i++) {
      const bx = Math.round((x + (icon.width + gap) + innerX + i * blockStep) * uiScale);
      const by = Math.round((y + yOffset + innerY) * uiScale);
      ctx.drawImage(blockImage, bx, by, blockW * uiScale, blockH * uiScale);
    }
  };

  return {
    update() {},
    draw(ctx, scale) {
      for (const bar of bars) drawBar(ctx, scale, bar);
    },
  };
};