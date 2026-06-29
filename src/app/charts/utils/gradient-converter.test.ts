/**
 * 渐变色转换器测试
 */

import { convertCSSGradientToECharts, isGradientColor, processColorValue } from './gradient-converter';

describe('Gradient Converter', () => {
  describe('isGradientColor', () => {
    it('should detect linear-gradient', () => {
      expect(isGradientColor('linear-gradient(90deg, #5470c6 0%, #91cc75 100%)')).toBe(true);
    });

    it('should detect radial-gradient', () => {
      expect(isGradientColor('radial-gradient(circle, #5470c6 0%, #91cc75 100%)')).toBe(true);
    });

    it('should not detect solid colors', () => {
      expect(isGradientColor('#5470c6')).toBe(false);
      expect(isGradientColor('rgba(84, 112, 198, 1)')).toBe(false);
    });
  });

  describe('convertCSSGradientToECharts', () => {
    it('should convert simple linear gradient', () => {
      const result = convertCSSGradientToECharts('linear-gradient(90deg, #5470c6 0%, #91cc75 100%)');
      expect(result).not.toBeNull();
      expect(result?.colorStops).toHaveLength(2);
      expect(result?.colorStops[0]).toEqual({ offset: 0, color: '#5470c6' });
      expect(result?.colorStops[1]).toEqual({ offset: 1, color: '#91cc75' });
    });

    it('should convert RGBA gradient (uppercase)', () => {
      const result = convertCSSGradientToECharts('linear-gradient(90deg, RGBA(45, 210, 62, 0.67) 4%, RGBA(255, 0, 0, 1) 100%)');
      expect(result).not.toBeNull();
      expect(result?.colorStops).toHaveLength(2);
      expect(result?.colorStops[0]).toEqual({ offset: 0.04, color: 'RGBA(45, 210, 62, 0.67)' });
      expect(result?.colorStops[1]).toEqual({ offset: 1, color: 'RGBA(255, 0, 0, 1)' });
    });

    it('should convert mixed case RGBA gradient with spaces', () => {
      // 用户实际遇到的渐变字符串
      const result = convertCSSGradientToECharts('linear-gradient(90deg, rgba(175,51,242,1) 0%, RGBA(175, 51, 242, 1) 37%, rgba(84,112,198,1) 100%)');
      expect(result).not.toBeNull();
      expect(result?.colorStops).toHaveLength(3);
      expect(result?.colorStops[0]).toEqual({ offset: 0, color: 'rgba(175,51,242,1)' });
      expect(result?.colorStops[1]).toEqual({ offset: 0.37, color: 'RGBA(175, 51, 242, 1)' });
      expect(result?.colorStops[2]).toEqual({ offset: 1, color: 'rgba(84,112,198,1)' });
    });

    it('should convert rgba gradient (lowercase)', () => {
      const result = convertCSSGradientToECharts('linear-gradient(90deg, rgba(168,84,198,0.64) 0%, rgba(255,0,0,1) 100%)');
      expect(result).not.toBeNull();
      expect(result?.colorStops).toHaveLength(2);
      expect(result?.colorStops[0]).toEqual({ offset: 0, color: 'rgba(168,84,198,0.64)' });
      expect(result?.colorStops[1]).toEqual({ offset: 1, color: 'rgba(255,0,0,1)' });
    });

    it('should convert multi-stop gradient', () => {
      const result = convertCSSGradientToECharts('linear-gradient(90deg, #5470c6 0%, #91cc75 50%, #fac858 100%)');
      expect(result).not.toBeNull();
      expect(result?.colorStops).toHaveLength(3);
      expect(result?.colorStops[0]).toEqual({ offset: 0, color: '#5470c6' });
      expect(result?.colorStops[1]).toEqual({ offset: 0.5, color: '#91cc75' });
      expect(result?.colorStops[2]).toEqual({ offset: 1, color: '#fac858' });
    });

    it('should handle different angles', () => {
      const result0 = convertCSSGradientToECharts('linear-gradient(0deg, #5470c6 0%, #91cc75 100%)');
      expect(result0).not.toBeNull();
      expect(result0?.x0).toBe(0);
      expect(result0?.y0).toBe(1);
      expect(result0?.x1).toBe(0);
      expect(result0?.y1).toBe(0);

      const result90 = convertCSSGradientToECharts('linear-gradient(90deg, #5470c6 0%, #91cc75 100%)');
      expect(result90).not.toBeNull();
      expect(result90?.x0).toBe(0);
      expect(result90?.y0).toBe(0);
      expect(result90?.x1).toBe(1);
      expect(result90?.y1).toBe(0);

      const result180 = convertCSSGradientToECharts('linear-gradient(180deg, #5470c6 0%, #91cc75 100%)');
      expect(result180).not.toBeNull();
      expect(result180?.x0).toBe(0);
      expect(result180?.y0).toBe(0);
      expect(result180?.x1).toBe(0);
      expect(result180?.y1).toBe(1);
    });

    it('should return null for invalid input', () => {
      expect(convertCSSGradientToECharts('')).toBeNull();
      expect(convertCSSGradientToECharts('#5470c6')).toBeNull();
      expect(convertCSSGradientToECharts('rgba(84, 112, 198, 1)')).toBeNull();
    });

    it('should return null if less than 2 color stops', () => {
      const result = convertCSSGradientToECharts('linear-gradient(90deg, #5470c6 0%)');
      expect(result).toBeNull();
    });
  });

  describe('processColorValue', () => {
    it('should convert gradient strings', () => {
      const result = processColorValue('linear-gradient(90deg, #5470c6 0%, #91cc75 100%)');
      expect(result).not.toBe('linear-gradient(90deg, #5470c6 0%, #91cc75 100%)');
      expect(typeof result).toBe('object');
    });

    it('should return solid colors as-is', () => {
      expect(processColorValue('#5470c6')).toBe('#5470c6');
      expect(processColorValue('rgba(84, 112, 198, 1)')).toBe('rgba(84, 112, 198, 1)');
    });

    it('should return objects as-is', () => {
      const obj = { x: 1, y: 2 };
      expect(processColorValue(obj)).toBe(obj);
    });
  });
});
