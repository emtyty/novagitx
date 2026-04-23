import { useEffect, useState } from "react";
import { TitleBar } from "@/components/git/TitleBar";
import { Sidebar } from "@/components/git/Sidebar";
import { CommitGraph } from "@/components/git/CommitGraph";
import { DetailsPanel } from "@/components/git/DetailsPanel";
import { CommandPalette } from "@/components/git/CommandPalette";
import { commits } from "@/data/repo";
import { GitBranch, ArrowDown, ArrowUp } from "lucide-react";

const Index = () => {
  const [selected, setSelected] = useState(commits[2]);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.title = "Git Extensions for macOS — lighthousewebapp";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "A native-feeling macOS redesign of Git Extensions: branch graph, diff viewer, command palette.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="min-h-screen w-full p-4 sm:p-6 md:p-8 flex items-stretch justify-center">
      <h1 className="sr-only">Git Extensions for macOS — lighthousewebapp repository</h1>

      <div className="mac-window w-full max-w-[1500px] h-[min(900px,calc(100vh-4rem))] flex flex-col">
        <TitleBar onOpenPalette={() => setPaletteOpen(true)} />

        <div className="flex flex-1 min-h-0">
          <Sidebar />

          <section className="flex-1 min-w-0 flex flex-col bg-window">
            {/* Branch context bar */}
            <div className="h-9 border-b border-border flex items-center gap-3 px-3 bg-titlebar/60">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                <GitBranch className="size-3.5 text-primary" />
                feature/unit-testing
              </div>
              <span className="text-muted-foreground/50">·</span>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><ArrowDown className="size-3" />1</span>
                <span className="flex items-center gap-0.5"><ArrowUp className="size-3" />0</span>
                <span>behind origin</span>
              </div>
              <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="px-2 py-0.5 rounded-md bg-muted">All branches</span>
                <span className="px-2 py-0.5 rounded-md hover:bg-muted cursor-pointer">Current</span>
                <span className="px-2 py-0.5 rounded-md hover:bg-muted cursor-pointer">Local</span>
              </div>
            </div>

            <CommitGraph selectedId={selected.id} onSelect={setSelected} />
            <DetailsPanel commit={selected} />

            {/* Status bar */}
            <div className="h-7 border-t border-border bg-titlebar/80 flex items-center gap-3 px-3 text-[10.5px] text-muted-foreground font-mono">
              <span>● {commits.length} commits</span>
              <span>HEAD → feature/unit-testing</span>
              <span className="ml-auto">UTF-8</span>
              <span>git 2.45.1</span>
            </div>
          </section>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </main>
  );
};

export default Index;
