import type { DigitalChannel } from '../../types/marketing';
import { DIGITAL_CHANNELS, SOCIAL_STATS } from '../../data/marketingDemoData';
import { priorityLabel } from './marketingPresentation';

interface MarketingChannelsTabProps {
  activeChannelId: string;
  onChannelChange: (id: string) => void;
}

export function MarketingChannelsTab({ activeChannelId, onChannelChange }: MarketingChannelsTabProps) {
  const active = DIGITAL_CHANNELS.find((c) => c.id === activeChannelId) ?? DIGITAL_CHANNELS[0];

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      {/* Mobile : liste verticale */}
      <div className="flex flex-col gap-2 sm:hidden">
        {DIGITAL_CHANNELS.map((channel) => (
          <ChannelPickerButton
            key={channel.id}
            channel={channel}
            active={activeChannelId === channel.id}
            onClick={() => onChannelChange(channel.id)}
          />
        ))}
      </div>

      {/* Tablette+ : grille */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DIGITAL_CHANNELS.map((channel) => (
          <ChannelPickerButton
            key={channel.id}
            channel={channel}
            active={activeChannelId === channel.id}
            onClick={() => onChannelChange(channel.id)}
            grid
          />
        ))}
      </div>

      <ChannelDetail channel={active} />

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-3">
        {SOCIAL_STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-sm min-w-0">
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className="p-3 sm:p-4">
              <p className="text-xs text-stone-500 break-words">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">{stat.value}</p>
              <p className="text-xs text-stone-500 mt-1 break-words">{stat.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelPickerButton({
  channel,
  active,
  onClick,
  grid = false,
}: {
  channel: DigitalChannel;
  active: boolean;
  onClick: () => void;
  grid?: boolean;
}) {
  const Icon = channel.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl sm:rounded-2xl border text-left transition min-w-0 w-full ${
        grid ? 'p-4' : 'p-3 flex items-center gap-3'
      } ${
        active ? `${channel.activeBorder} shadow-sm` : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className={`inline-flex items-center justify-center rounded-lg ${channel.iconWrapClass} ${grid ? 'h-9 w-9 mb-2' : 'h-10 w-10 shrink-0'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className={grid ? '' : 'min-w-0 flex-1'}>
        <p className="font-semibold text-stone-900 text-sm break-words">{channel.name}</p>
        <span className={`inline-flex mt-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${channel.chipClass}`}>
          {priorityLabel(channel.priority)}
        </span>
      </div>
    </button>
  );
}

function ChannelDetail({ channel }: { channel: DigitalChannel }) {
  const Icon = channel.icon;
  return (
    <section className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white p-3 sm:p-4 md:p-6 shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
        <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${channel.iconWrapClass}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-stone-900 break-words">{channel.name}</h3>
          <span className={`inline-flex mt-1 rounded-full border px-2.5 py-1 text-xs font-medium ${channel.chipClass}`}>
            {priorityLabel(channel.priority)}
          </span>
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 text-sm">
        <div className="min-w-0 rounded-lg bg-stone-50/80 p-3 sm:bg-transparent sm:p-0">
          <dt className="text-stone-500 mb-1 text-xs uppercase tracking-wide font-medium">Cible</dt>
          <dd className="font-medium text-stone-900 break-words">{channel.target}</dd>
        </div>
        <div className="min-w-0 rounded-lg bg-stone-50/80 p-3 sm:bg-transparent sm:p-0">
          <dt className="text-stone-500 mb-1 text-xs uppercase tracking-wide font-medium">Contenu</dt>
          <dd className="font-medium text-stone-900 break-words">{channel.content}</dd>
        </div>
        <div className="min-w-0 rounded-lg bg-stone-50/80 p-3 sm:bg-transparent sm:p-0 sm:col-span-2 lg:col-span-1">
          <dt className="text-stone-500 mb-1 text-xs uppercase tracking-wide font-medium">Fréquence</dt>
          <dd className="font-medium text-stone-900 break-words">{channel.frequency}</dd>
        </div>
      </dl>
    </section>
  );
}
