// examples/demo/ui/statusPanel.js
export const statusPanel = (needs, getAsset, { x = 8, y = 4, spacing = 10 } = {}) => {
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
    const px = x * scale;
    const py = (y + yOffset) * scale;

    ctx.drawImage(icon, px, py, icon.width * scale, icon.height * scale);

    const fx = px + (icon.width + gap) * scale;
    const fy = py;
    ctx.drawImage(frameImage, fx, fy, frameImage.width * scale, frameImage.height * scale);

    const filled = Math.max(0, Math.min(maxBlocks, Math.round(get())));
    for (let i = 0; i < filled; i++) {
      const bx = (x + (icon.width + gap) + innerX + i * blockStep) * scale;
      const by = (y + yOffset + innerY) * scale;
      ctx.drawImage(blockImage, bx, by, blockW * scale, blockH * scale);
    }
  };

  return {
    update() {},
    draw(ctx, scale) {
      for (const bar of bars) drawBar(ctx, scale, bar);
    },
  };
};