import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class KpiCardComponent {
  @Input() titulo = '';
  @Input() valor: string | number = '';
  @Input() detalle = '';
  @Input() variante: 'normal' | 'positivo' | 'advertencia' | 'riesgo' = 'normal';
}