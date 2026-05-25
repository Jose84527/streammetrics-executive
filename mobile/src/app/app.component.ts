import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

interface MenuItem {
  titulo: string;
  ruta: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonMenu,
    IonMenuToggle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonRouterOutlet
  ]
})
export class AppComponent {
  readonly opcionesMenu: MenuItem[] = [
    { titulo: 'Dashboard', ruta: '/dashboard' },
    { titulo: 'Consumo', ruta: '/consumo' },
    { titulo: 'Mercados', ruta: '/mercados' },
    { titulo: 'Planes', ruta: '/planes' },
    { titulo: 'Metas', ruta: '/metas' },
    { titulo: 'Perfiles', ruta: '/perfiles' },
    { titulo: 'Contenidos', ruta: '/contenidos' },
    { titulo: 'Reporte ejecutivo', ruta: '/reporte-ejecutivo' },
    { titulo: 'Servidor', ruta: '/configuracion-servidor' }
  ];
}