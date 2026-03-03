import type { ConnectionStatus as Status } from '../types';

const STATUS_CONFIG: Record<Status, { color: string; label: string }> = {
  connecting: { color: 'bg-yellow-500', label: 'Connecting' },
  connected: { color: 'bg-green-500', label: 'Connected' },
  disconnected: { color: 'bg-gray-500', label: 'Disconnected' },
  error: { color: 'bg-red-500', label: 'Error' },
};

interface ConnectionStatusProps {
  status: Status;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${config.color} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-gray-400">{config.label}</span>
    </div>
  );
}
