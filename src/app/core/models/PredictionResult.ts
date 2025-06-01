import { FoncierBati } from "./foncierBati";
import { FoncierNonBati } from "./foncierNonBati";
import { Vehicule } from "./vehicule";

export class PredictionResult {
  foncierBati: FoncierBati;
  foncierNonBati: FoncierNonBati;
  vehicule: Vehicule;
  prediction: number;
  ecartPourcentage?: number;
}