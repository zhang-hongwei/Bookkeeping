/**
 * CSS Grid Repetition Utilities
 * Groups repeated units and creates CSS repeat() notation
 * Ported from original cssgridgenerator implementation
 */

/**
 * Groups repeated consecutive units together
 * Example: [1fr, 1fr, 1fr, 2fr] → [[1fr, 1fr, 1fr], [2fr]]
 */
export function groupRepeatedUnits(
  templateUnitArray: Array<{ unit: string }> = [{ unit: '1fr' }]
): string[][] {
  const templateArray = templateUnitArray.map(i => i.unit);
  const groups: string[][] = [[templateArray.shift() || '1fr']];

  for (const templateUnit of templateArray) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup.indexOf(templateUnit) !== -1) {
      lastGroup.push(templateUnit);
    } else {
      groups.push([templateUnit]);
    }
  }

  return groups;
}

/**
 * Creates CSS repetition notation from grouped units
 * Example: [[1fr, 1fr, 1fr], [2fr]] → 'repeat(3, 1fr) 2fr'
 *
 * @param maxRepetition - Minimum number of repetitions before using repeat()
 *                       Default: 1 (always use repeat for multiple identical units)
 */
export function createRepetition(groups: string[][], maxRepetition = 1): string {
  return groups
    .map(group => {
      // Use repeat() for multiple identical units
      if (group.length > maxRepetition) {
        return `repeat(${group.length}, ${group[0]})`;
      }
      return group.join(' ');
    })
    .join(' ');
}
