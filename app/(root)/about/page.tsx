import DevDetails from '@/components/about/DevDetails';
import VideoTutorial from '@/components/about/VideoTutorial';

export default function AboutPage() {
  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2 leading-[1.2] tracking-[-0.025em]">
             About
          </h1>
          <p className="text-base text-[hsl(var(--muted-foreground))]">
             Who are We????
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <DevDetails />
          <VideoTutorial />
        </div>
      </div>
    </div>
  );
}