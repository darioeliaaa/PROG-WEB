import { bootstrapApplication } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

// Aspetto comune di tutti i grafici: font, colori degli assi e tooltip dell'app.
// I plugin vanno registrati prima, altrimenti legend e tooltip non hanno ancora i default.
Chart.register(...registerables);
Chart.defaults.locale = 'it-IT';
Chart.defaults.font.family = "'Hanken Grotesk', system-ui, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#7D8B86';
Chart.defaults.borderColor = '#E3E8E2';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.boxHeight = 8;
Chart.defaults.plugins.legend.labels.padding = 14;
Chart.defaults.plugins.tooltip.backgroundColor = '#10231F';
Chart.defaults.plugins.tooltip.titleColor = '#E8EEE9';
Chart.defaults.plugins.tooltip.bodyColor = '#E8EEE9';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.tooltip.boxPadding = 4;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
