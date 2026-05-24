import { Component, Input } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-insight-card',
  templateUrl: './insight-card.component.html',
  styleUrls: ['./insight-card.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class InsightCardComponent {
  @Input() titulo = 'Lectura ejecutiva';
  @Input() descripcion = '';
  @Input() nivel: 'informativo' | 'positivo' | 'advertencia' | 'riesgo' = 'informativo';
}