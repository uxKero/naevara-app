import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Hub de personajes: la puerta de entrada. Cada tarjeta lleva a su perfil.
// El color de acento de cada tarjeta viene de su clase .theme-* (globals.css).
const PERSONAJES = [
  {
    href: "/naevara",
    theme: "theme-naevara",
    img: "/naevara-0.png",
    nombre: "Naevara Tirael",
    clase: "Brujo del Gran Antiguo",
    sub: "Semielfa · Nivel 6 · Pacto del Tomo",
    tagline: "La que observa desde lejos.",
  },
  {
    href: "/vaegrant",
    theme: "theme-vaegrant",
    img: "/vaegrant-galeria/vaegrant-1.jpg",
    nombre: "Vaegrant",
    clase: "Brujo del Archifey",
    sub: "Aeril Tirael · Silvapor",
    tagline: "El pacto bajo el crepúsculo.",
  },
];

export default function Hub() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-20 sm:pt-24">
        <header className="mb-10 text-center sm:mb-14">
          <p className="sec-label text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Crónicas de
          </p>
          <h1 className="display-font mt-2 text-5xl font-semibold text-foreground sm:text-6xl">
            Tirael
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Elegí a quién acompañar esta noche.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PERSONAJES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={cn(p.theme, "group block focus:outline-none")}
              aria-label={`Abrir el perfil de ${p.nombre}`}
            >
              <Card
                variant="interactive"
                className="flex h-full flex-col overflow-hidden p-0"
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={p.img}
                    alt={p.nombre}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <Badge variant="glow" className="mb-2">
                      {p.clase}
                    </Badge>
                    <h2 className="display-font text-2xl font-semibold text-foreground">
                      {p.nombre}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.sub}</p>
                  </div>
                </div>
                <CardContent className="mt-auto flex items-center justify-between gap-3 p-4">
                  <span className="text-sm text-muted-foreground">{p.tagline}</span>
                  <span
                    className={cn(
                      buttonVariants({ variant: "glow", size: "sm" }),
                      "shrink-0",
                    )}
                  >
                    Entrar
                    <ArrowRight className="size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground/70">
          Dos brujos, un mismo linaje. La historia sigue abierta.
        </p>
      </div>
    </main>
  );
}
