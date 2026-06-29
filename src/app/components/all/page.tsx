'use client';

import { Box, Typography, Grid } from '@mui/material';
import ComponentShowcaseCard from './ComponentShowcaseCard';
import DemoNavigation from '../demos/DemoNavigation';
import {
  inputComponents,
  dataDisplayComponents,
  feedbackComponents,
  surfaceComponents,
  navigationComponents,
  layoutComponents,
} from './componentsData';

// Component categories with data
const componentCategories = [
  {
    id: 'inputs',
    title: 'Inputs',
    components: inputComponents,
  },
  {
    id: 'data-display',
    title: 'Data display',
    components: dataDisplayComponents,
  },
  {
    id: 'feedback',
    title: 'Feedback',
    components: feedbackComponents,
  },
  {
    id: 'surface',
    title: 'Surface',
    components: surfaceComponents,
  },
  {
    id: 'navigation',
    title: 'Navigation',
    components: navigationComponents,
  },
  {
    id: 'layout',
    title: 'Layout',
    components: layoutComponents,
  },
];

export default function AllComponentsPage() {
  // Prepare navigation items
  const navItems = componentCategories.map((category) => ({
    id: category.id,
    title: category.title,
  }));

  return (
    <Box sx={{ maxWidth: '1000px', mr: '320px' }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Material UI components
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', mb: 2 }}>
          Every Material UI component available so far.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '900px' }}>
          Material UI aims to provide building blocks for developers to create great user
          interfaces using the Material Design guidelines as a reference, which we strive to
          follow where practical. The library doesn't necessarily implement the exact specs of
          every component or feature—where official guidelines are incomplete or contradictory,
          maintainers apply common sense along with the latest standards in web development.
        </Typography>
      </Box>

      {/* Component Categories */}
      {componentCategories.map((category) => (
        <Box key={category.id} id={category.id} sx={{ mb: 6, scrollMarginTop: '100px' }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {category.title}
          </Typography>

          <Grid container spacing={2} sx={{ pt: 1 }}>
            {category.components.map((component) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={component.name}>
                <ComponentShowcaseCard
                  name={component.name}
                  link={component.link}
                  srcLight={component.srcLight}
                  srcDark={component.srcDark}
                  md1={component.md1}
                  md2={component.md2}
                  md3={component.md3}
                  noGuidelines={component.noGuidelines}
                  imgLoading={category.title === 'Inputs' ? 'eager' : 'lazy'}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Fixed navigation on the right */}
      <DemoNavigation items={navItems} />
    </Box>
  );
}
