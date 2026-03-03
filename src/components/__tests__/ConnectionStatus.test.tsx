import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConnectionStatus } from '../ConnectionStatus';

describe('ConnectionStatus', () => {
  it('renders "Connecting" with yellow indicator', () => {
    const { container } = render(<ConnectionStatus status="connecting" />);
    expect(screen.getByText('Connecting')).toBeInTheDocument();
    const dot = container.querySelector('.bg-yellow-500');
    expect(dot).toBeInTheDocument();
  });

  it('renders "Connected" with green indicator', () => {
    const { container } = render(<ConnectionStatus status="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
    const dot = container.querySelector('.bg-green-500');
    expect(dot).toBeInTheDocument();
  });

  it('renders "Disconnected" with gray indicator', () => {
    const { container } = render(<ConnectionStatus status="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    const dot = container.querySelector('.bg-gray-500');
    expect(dot).toBeInTheDocument();
  });

  it('renders "Error" with red indicator', () => {
    const { container } = render(<ConnectionStatus status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    const dot = container.querySelector('.bg-red-500');
    expect(dot).toBeInTheDocument();
  });

  it('applies pulse animation when connecting', () => {
    const { container } = render(<ConnectionStatus status="connecting" />);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });
});
