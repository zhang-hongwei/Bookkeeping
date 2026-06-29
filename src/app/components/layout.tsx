'use client';

import { Box } from '@mui/material';
import { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ComponentSidebar } from './shared/ComponentSidebar';
import { allComponents } from './constants/componentData';

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['all']);

  // Extract component ID from pathname
  const selectedComponent = pathname.split('/components/')[1] || null;

  // Filter components based on search
  const filteredComponents = useMemo(() => {
    if (!searchQuery) return allComponents;
    return allComponents.filter((component) =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle panel expansion
  const handlePanelChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded) {
      setExpandedPanels(prev => [...prev, panel]);
    } else {
      setExpandedPanels(prev => prev.filter(p => p !== panel));
    }
  };

  // Handle component selection - navigate to URL
  const handleComponentSelect = (componentId: string) => {
    router.push(`/components/${componentId}`);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <ComponentSidebar
        components={allComponents}
        filteredComponents={filteredComponents}
        selectedComponent={selectedComponent}
        searchQuery={searchQuery}
        expandedPanels={expandedPanels}
        onSearchChange={setSearchQuery}
        onComponentSelect={handleComponentSelect}
        onPanelChange={handlePanelChange}
      />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}
