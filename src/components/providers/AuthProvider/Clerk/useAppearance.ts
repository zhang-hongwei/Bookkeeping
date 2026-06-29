'use client';

// Simple fallback without external dependencies

export const useAppearance = () => {
  // Simple fallback appearance without external dependencies
  return {
    baseTheme: undefined,
    elements: {},
    layout: {
      helpPageUrl: 'https://lobehub.com/docs',
      privacyPageUrl: 'https://lobehub.com/privacy',
      socialButtonsVariant: 'blockButton' as const,
      termsPageUrl: 'https://lobehub.com/terms',
    },
    variables: {
      borderRadius: '8px',
      colorBackground: '#ffffff',
      colorDanger: '#ff4d4f',
      colorInputBackground: '#f5f5f5',
      colorNeutral: '#000000',
      colorSuccess: '#52c41a',
      colorText: '#000000',
      colorTextSecondary: '#8c8c8c',
      colorWarning: '#faad14',
      fontSize: '14px',
    },
  };
};
