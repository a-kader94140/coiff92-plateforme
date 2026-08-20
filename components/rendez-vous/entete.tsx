import { Badge } from "@/components/ui/badge";
import { LIBELLES_TYPE, type Salon } from "@/lib/salons";

/* L'identité du salon, partagée par les deux présentations du
   formulaire : la page pleine et le panneau qui la recouvre. Le visiteur
   doit savoir à qui il écrit sans avoir à remonter. */
export function EnteteDemande({ salon }: { salon: Salon }) {
  return (
    <div>
      <p className="m-0 mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
        Demande de rendez-vous
      </p>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[clamp(24px,3.4vw,32px)] leading-tight">{salon.name}</h1>
        {salon.demo && <Badge tone="demo" />}
      </div>
      <p className="m-0 text-sm text-muted-1">
        {LIBELLES_TYPE[salon.type]}, {salon.street},{" "}
        <span className="tabular">{salon.postalCode}</span> {salon.city}
      </p>
    </div>
  );
}
