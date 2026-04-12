import { Link } from '@tanstack/react-router';
import { useAuth } from '@/config/auth';
import { ArrowRight } from 'lucide-react';

const features = [
  {
    code: '01',
    title: 'Player Roster',
    desc: 'Maintain complete records — history, W/L records, opponent strength.',
  },
  {
    code: '02',
    title: 'Tournaments',
    desc: 'Run multiple tournaments simultaneously with independent round control.',
  },
  {
    code: '03',
    title: 'Live Intel',
    desc: 'Real-time standings with Buchholz-style opponent strength metrics.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">

      {/* Scanlines CRT overlay */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.045)_2px,rgba(0,0,0,0.045)_4px)] pointer-events-none z-3" />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,var(--color-raised)_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none z-0" />

      {/* Radar — positioned to right side */}
      <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 w-[680px] h-[680px] pointer-events-none z-1">
        {/* Concentric rings */}
        {[72, 150, 240, 340, 450].map((r, i) => (
          <div key={r} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: r * 2, height: r * 2,
            marginTop: -r, marginLeft: -r,
            borderRadius: '50%',
            border: `1px solid rgba(240,160,32,${(0.22 - i * 0.037).toFixed(3)})`,
          }} />
        ))}
        {/* Crosshair H */}
        <div className="absolute top-1/2 left-0 right-0 h-px -mt-[0.5px] bg-[rgba(240,160,32,0.09)]" />
        {/* Crosshair V */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -ml-[0.5px] bg-[rgba(240,160,32,0.09)]" />

        {/* Conic sweep gradient — rotates as a whole */}
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(240,160,32,0.04)_330deg,rgba(240,160,32,0.14)_355deg,rgba(240,160,32,0.22)_360deg)] animate-[radarSweep_8s_linear_infinite] overflow-hidden" />

        {/* Sweep tip: half-line with glowing dot at tip */}
        <div className="absolute top-1/2 left-1/2 w-1/2 h-px -mt-[0.5px] origin-[0_50%] animate-[radarSweep_8s_linear_infinite]">
          <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-[rgba(240,160,32,0.9)] shadow-[0_0_10px_3px_rgba(240,160,32,0.5)]" />
        </div>
      </div>

      {/* Radial vignette — masks radar toward the content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_50%,transparent_28%,var(--color-bg)_72%)] pointer-events-none z-2" />

      {/* Diagonal accent line */}
      <div className="absolute top-0 left-[47%] w-px h-full bg-[linear-gradient(180deg,transparent_0%,var(--color-border)_20%,var(--color-border)_80%,transparent_100%)] [transform:skewX(-8deg)] pointer-events-none z-2" />

      <div className="relative z-4 flex-1 flex flex-col justify-center py-8 max-w-[1000px] mx-auto w-full">

        {/* Status label with blinking dot + pulse ring */}
        <div className="anim-0 flex items-center gap-2.5 mb-6">
          <div className="relative w-2 h-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-accent animate-[blink_1.4s_step-end_infinite]" />
            <div className="absolute inset-0 rounded-full bg-accent animate-[pulseRing_1.4s_ease-out_infinite]" />
          </div>
          <span className="tracking-widest text-muted uppercase">
            Tournament Director Platform · System Online
          </span>
        </div>

        {/* Hero heading */}
        <h1 className="anim-1 text-[clamp(3rem,10vw,7rem)] tracking-wider leading-[0.88] text-text mt-0 mb-6">
          COMMAND<br />
          <span className="text-transparent [-webkit-text-stroke:2px_var(--color-accent)] opacity-70">YOUR</span><br />
          <span className="text-accent">TOURNAMENT</span>
        </h1>

        {/* Designation line */}
        <div className="anim-2 flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-accent opacity-60" />
          <span className="tracking-widest text-accent uppercase opacity-70">
            Designation: TOURNEY-26
          </span>
        </div>

        {/* Sub-heading */}
        <p className="anim-2 text-2xl text-muted max-w-[70%] leading-[1.7] mb-10">
          Command your tournament from player registration to final standings.
          Track every round, every game, every player, every scenario.
        </p>

        {/* CTA */}
        <div className="anim-3 flex gap-3 flex-wrap">
          {user ? (
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-1.5"><ArrowRight size={14} /> Enter Command Center</Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary inline-flex items-center gap-1.5"><ArrowRight size={14} /> Begin Mission</Link>
              <Link to="/login" className="btn-secondary">Learn More</Link>
            </>
          )}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-px mt-20 bg-border">
          {features.map((f, i) => (
            <div key={f.code} className={`anim-${i + 4} bg-surface py-5 px-6 relative overflow-hidden transition-colors duration-200 hover:bg-raised`}>
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,var(--color-accent),transparent_75%)]" />
              <div className="tracking-widest text-accent mb-2.5">
                [{f.code}]
              </div>
              <h3 className="text-2xl tracking-wider text-text m-0 mb-2">
                {f.title}
              </h3>
              <p className="text-muted m-0 leading-[1.6]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
