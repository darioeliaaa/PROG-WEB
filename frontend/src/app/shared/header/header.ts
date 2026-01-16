import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {

  // Proprietà di stato per gestire la visibilità degli elementi nella UI
  isLoggedIn: boolean = false;
  showMenu: boolean = false;
  userSettings: any; // Memorizza dati come avatar o preferenze dell'utente
  listaNotifiche: any[] = [];

  constructor(
    public router: Router,
    public userService: UserService,
    private cdr: ChangeDetectorRef // Utilizzato per forzare l'aggiornamento della UI
  ) {

    // 1. Sincronizzazione immediata: legge lo stato di login all'istante della creazione del componente
    this.isLoggedIn = this.userService.isLoggedIn();

    // 2. Sottoscrizione asincrona: resta in ascolto del Service.
    // Se l'utente fa login/logout in un'altra parte dell'app, l'header reagisce subito.
    this.userService.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
      // Forza Angular a controllare se ci sono cambiamenti nel template
      this.cdr.detectChanges();
    });
  }

  /**
   * Getter calcolato per verificare la presenza di nuove notifiche.
   * Viene usato nel template per mostrare/nascondere il "pallino" rosso sulla campana.
   */
  get haNotificheNonLette(): boolean {
    return this.listaNotifiche.length > 0;
  }

  /**
   * Inizializzazione del componente: recupera le impostazioni dell'utente (avatar, colori, ecc.)
   */
  ngOnInit() {
    // 1. Recupero sincrono: utile per evitare "flash" di contenuti mancanti al ricaricamento della pagina
    const currentSettings = this.userService.getSettingsSync();
    if (currentSettings) {
      this.userSettings = currentSettings;
    }

    // 2. Recupero asincrono: si aggiorna se l'utente cambia impostazioni (es. cambia foto profilo)
    this.userService.userSettings$.subscribe(settings => {
      if (settings) {
        console.log("Header: Ricevute nuove impostazioni", settings);
        this.userSettings = settings;
        // ✅ Risolve il problema della campana o dei bottoni che non appaiono subito
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Gestisce l'apertura/chiusura del menu a tendina (dropdown) dell'utente
   */
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  /**
   * Chiude il menu (utile quando si clicca fuori o si naviga altrove)
   */
  closeMenu() {
    this.showMenu = false;
  }

  /**
   * Esegue la procedura di uscita: pulisce i dati nel Service e reindirizza al login
   */
  logout() {
    this.showMenu = false; // Chiude il menu prima di uscire
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
