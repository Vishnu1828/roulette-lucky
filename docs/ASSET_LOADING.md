# Asset Loading System

## Overview

This project uses a resolution-based asset loading system that automatically loads the appropriate texture quality based on the user's screen size and device characteristics.

## Texture Resolutions

The game includes two sets of textures:

- **1080p (resolution: 1)** - Standard quality for regular displays
- **4K (resolution: 2)** - High quality for Retina, 4K, and high-DPI displays

## How It Works

### 1. Asset Structure

All texture assets are organized in the following directory structure:

```
public/assets/texture/
├── 1080p/
│   ├── background/
│   └── ui/
└── 4k/
    ├── background/
    └── ui/
```

### 2. Asset Manifest

The `assetPack.json` defines each texture asset with multiple resolution variants:

```json
{
  "alias": "background-bg-desktop",
  "src": [
    {
      "src": "/assets/texture/1080p/background/bg_desktop.png",
      "resolution": 1
    },
    {
      "src": "/assets/texture/4k/background/bg_desktop_4k.png",
      "resolution": 2
    }
  ]
}
```

### 3. Automatic Resolution Detection

When the game loads, the system detects the optimal resolution based on:

- **Device Pixel Ratio (DPR)** - Retina displays have DPR ≥ 2
- **Screen Dimensions** - Width and height in pixels
- **Total Pixel Count** - Overall display quality indicator

#### Resolution Selection Logic

**4K Textures (resolution: 2) are loaded when:**

- Large screens (≥ 1024px) with high DPR (≥ 2) - Retina laptops/desktops
- OR effective screen dimension ≥ 2160 pixels (true 4K displays)

**1080p Textures (resolution: 1) are loaded when:**

- Mobile devices (screen < 1024px) - regardless of DPR
- Standard desktop displays (DPR < 2)

**Mobile Priority:** All mobile devices load 1080p textures, even with high DPR (iPhone, Android). This prevents wasting bandwidth and memory on small screens.

### 4. Usage in Code

Simply reference assets by their alias - PixiJS automatically loads the correct resolution:

```typescript
import { Assets } from "pixi.js";

// PixiJS automatically loads the appropriate resolution
const texture = await Assets.load("background-bg-desktop");
```

### 5. Checking Current Resolution

You can check which resolution is being used:

```typescript
import { getCurrentTextureResolution } from "./utils/assets";

const { resolution, label, quality } = getCurrentTextureResolution();
console.log(`Using ${label} textures (${quality} quality)`);
// Output: "Using 4K textures (High quality)" or "Using 1080p textures (Standard quality)"
```

## Adding New Assets

When adding new texture assets:

1. **Create both versions:**
   - 1080p version in `public/assets/texture/1080p/`
   - 4K version in `public/assets/texture/4k/`
   - 4K version should be exactly 2x the dimensions of the 1080p version

2. **Update assetPack.json:**

   ```json
   {
     "alias": "ui-new-button",
     "src": [
       {
         "src": "/assets/texture/1080p/ui/new_button.png",
         "resolution": 1
       },
       {
         "src": "/assets/texture/4k/ui/new_button_4k.png",
         "resolution": 2
       }
     ]
   }
   ```

3. **Use the asset:**
   ```typescript
   const texture = await Assets.load("ui-new-button");
   ```

## Performance Considerations

- **Bandwidth**: Lower resolution devices automatically download smaller 1080p textures
- **Memory**: Reduced VRAM usage on devices with limited graphics memory
- **Loading Time**: Faster initial load on mobile and low-end devices
- **Quality**: High-end devices get crisp, sharp textures without upscaling

## Testing Different Resolutions

To test how the game looks with different resolutions:

1. **Chrome DevTools:**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
   - Select different devices or set custom DPR

2. **Forcing a Resolution (for testing):**
   - Modify `getTextureResolution()` in `src/utils/assets.ts` to return a hardcoded value
   - Reload the page

## Console Output

When assets load, you'll see console messages indicating the selected resolution:

```
[AssetLoader] Loading textures at 4K (2x) resolution
[AssetLoader] Screen: 1920x1080, DPR: 2
```

## Browser Compatibility

This system works with all modern browsers that support PixiJS:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

**Issue: Wrong resolution loading**

- Check console output for current resolution
- Verify device pixel ratio: `window.devicePixelRatio`
- Check screen size: `window.innerWidth × window.innerHeight`

**Issue: Missing textures**

- Ensure both 1080p and 4K versions exist
- Verify paths in `assetPack.json`
- Check browser console for 404 errors

**Issue: Blurry textures on high-DPI displays**

- Confirm 4K textures are exactly 2x the dimensions
- Verify the resolution detection is working (check console)
- Ensure assets are PNG files with no compression artifacts

## Mobile & Orientation Handling

The application includes optimizations for mobile devices and orientation changes:

**Instant Orientation Changes:**

- Portrait ↔ Landscape transitions are handled immediately (no debounce)
- Smooth layout updates using `requestAnimationFrame`
- No UI "glitching" or delays during rotation

**Mobile-Specific Optimizations:**

- Fixed positioning to prevent browser resize issues
- Touch-action controls to prevent unwanted zoom gestures
- Viewport configuration prevents scaling and zoom issues
- Overflow hidden to prevent scrolling

**Resize Handling:**

- Window resize events are debounced (50ms) for performance
- Orientation changes trigger immediate layout updates
- Layout store only updates when dimensions actually change

These optimizations ensure smooth performance across all devices and screen orientations.
