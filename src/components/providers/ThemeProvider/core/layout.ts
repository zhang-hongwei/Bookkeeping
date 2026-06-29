/**
 * Layout configuration for dashboard and navigation
 */

export interface LayoutConfig {
  // Navigation
  nav: {
    zIndex: number;
    mobileWidth: number;
    miniWidth: number;
    verticalWidth: number;
    horizontalHeight: number;
  };

  // Header
  header: {
    blur: number;
    zIndex: number;
    mobileHeight: number;
    desktopHeight: number;
  };

  // Transitions
  transition: {
    easing: string;
    duration: number; // in milliseconds
  };

  // Dashboard content spacing
  dashboard: {
    content: {
      pt: number; // padding-top (multiplier of spacing)
      pb: number; // padding-bottom (multiplier of spacing)
      px: number; // padding-x (multiplier of spacing)
    };
  };
}

/**
 * Default layout configuration
 */
export const layout: LayoutConfig = {
  nav: {
    zIndex: 1201,
    mobileWidth: 288,
    miniWidth: 88,
    verticalWidth: 300,
    horizontalHeight: 64,
  },
  header: {
    blur: 8,
    zIndex: 1101,
    mobileHeight: 64,
    desktopHeight: 72,
  },
  transition: {
    easing: "linear",
    duration: 120,
  },
  dashboard: {
    content: {
      pt: 1, // 1 * spacing (8px)
      pb: 8, // 8 * spacing (64px)
      px: 5, // 5 * spacing (40px)
    },
  },
};

/**
 * Helper to generate CSS custom properties for layout
 */
export function createLayoutCssVars(
  config: LayoutConfig = layout
): Record<string, string> {
  return {
    "--layout-nav-zIndex": config.nav.zIndex.toString(),
    "--layout-nav-mobile-width": `${config.nav.mobileWidth}px`,
    "--layout-nav-mini-width": `${config.nav.miniWidth}px`,
    "--layout-nav-vertical-width": `${config.nav.verticalWidth}px`,
    "--layout-nav-horizontal-height": `${config.nav.horizontalHeight}px`,

    "--layout-header-blur": `${config.header.blur}px`,
    "--layout-header-zIndex": config.header.zIndex.toString(),
    "--layout-header-mobile-height": `${config.header.mobileHeight}px`,
    "--layout-header-desktop-height": `${config.header.desktopHeight}px`,

    "--layout-transition-easing": config.transition.easing,
    "--layout-transition-duration": `${config.transition.duration}ms`,

    "--layout-dashboard-content-pt": `calc(${config.dashboard.content.pt} * var(--spacing))`,
    "--layout-dashboard-content-pb": `calc(${config.dashboard.content.pb} * var(--spacing))`,
    "--layout-dashboard-content-px": `calc(${config.dashboard.content.px} * var(--spacing))`,

    // Semantic colors for navigation
    "--layout-nav-bg": "var(--palette-background-default)",
    "--layout-nav-horizontal-bg":
      "rgba(var(--palette-background-defaultChannel) / 80%)",
    "--layout-nav-border-color": "rgba(var(--palette-grey-500Channel) / 12%)",
    "--layout-nav-text-primary-color": "var(--palette-text-primary)",
    "--layout-nav-text-secondary-color": "var(--palette-text-secondary)",
    "--layout-nav-text-disabled-color": "var(--palette-text-disabled)",
  };
}
