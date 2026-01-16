import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chi-siamo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './chi-siamo.html',
  styleUrls: ['./chi-siamo.css']
})
export class ChiSiamoComponent {

  // Definisce i dati per i widget informativi visualizzati nella sezione Hero
  heroWidgets = [
    {
      icon: '💎',
      label: 'Focus',
      value: 'Cristallino',
      desc: 'Zero distrazioni.',
      colorClass: 'text-blue'
    },
    {
      icon: '📈',
      label: 'Trend',
      value: '+124%',
      desc: 'Performance YTD',
      colorClass: 'text-green'
    },
    {
      icon: '🛡️',
      label: 'Privacy',
      value: '100%',
      desc: 'AES-256 Encrypted',
      colorClass: 'text-purple'
    }
  ];

  // Elenco delle caratteristiche principali dell'applicazione per la bento grid
  features = [
    {
      title: 'Intelligenza Predittiva',
      desc: 'I nostri algoritmi analizzano i trend passati per offrirti scenari futuri probabili, aiutandoti a decidere meglio.',
      icon: '🧠',
      class: 'bento-large'
    },
    {
      title: 'Dati Real-Time',
      desc: 'Aggiornamento costante dei prezzi per non perdere mai l’attimo giusto.',
      icon: '⚡',
      class: 'bento-small'
    },
    {
      title: 'Tutto in uno',
      desc: 'Crypto, Azioni, ETF e Cash: finalmente un’unica dashboard per tutto.',
      icon: '🌐',
      class: 'bento-small'
    },
    {
      title: 'Community',
      desc: 'Confrontati con altri investitori e scopri nuove strategie vincenti.',
      icon: '🤝',
      class: 'bento-medium'
    }
  ];

  // Configurazione dei membri del team con i relativi avatar in stile Notion
  team = [
    {
      name: 'Dario E.',
      role: 'CEO & Founder',
      img: 'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&beardProbability=100&glassesProbability=20'
    },
    {
      name: 'Mattia C.',
      role: 'Product Lead',
      img: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jude&beardProbability=0'
    },
    {
      name: 'Matteo I.',
      role: 'Tech Lead',
      img: 'https://api.dicebear.com/9.x/notionists/svg?seed=Caleb&beardProbability=50'
    },
    {
      name: 'Gianmaria F.',
      role: 'Data Scientist',
      img: 'https://api.dicebear.com/9.x/notionists/svg?seed=Zac&glassesProbability=100'
    }
  ];

}
