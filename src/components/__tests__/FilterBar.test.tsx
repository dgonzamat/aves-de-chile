import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../FilterBar';
import { REGIONES_CHILE } from '../../constants';

describe('FilterBar', () => {
  it('should render all regions in select', () => {
    const onRegionChange = vi.fn();
    render(<FilterBar region="" onRegionChange={onRegionChange} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    REGIONES_CHILE.forEach(region => {
      expect(screen.getByText(region.nombre)).toBeInTheDocument();
    });
  });

  it('should call onRegionChange when selection changes', () => {
    const onRegionChange = vi.fn();
    render(<FilterBar region="" onRegionChange={onRegionChange} />);
    
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'RM' }
    });
    
    expect(onRegionChange).toHaveBeenCalledWith('RM');
  });

  it('should show selected region', () => {
    const onRegionChange = vi.fn();
    render(<FilterBar region="RM" onRegionChange={onRegionChange} />);
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('RM');
  });
});