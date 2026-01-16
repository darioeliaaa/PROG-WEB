# MoneyMind - Personal Finance & Investment Platform

## ⚙️ Configurazione del Database

Per motivi di sicurezza, il file con le credenziali del database (`application.properties`) non è incluso nel repository.
Modifica il file 'application.properties' inserendo le tue credenziali di postgres oppure utilizzando le variabili di ambiente.

### Procedura di avvio:

1.  **Crea il Database:**
    Assicurati di avere un database PostgreSQL vuoto chiamato `moneymind`.
    ```sql
    CREATE DATABASE moneymind;
    ```
    I valori da caricare nel database, sono già stati sviluppati nel `DataInitializer.java`.
    

2. **Avvia il Backend:**
    Una volta configurato il file, esegui il progetto. Hibernate creerà automaticamente le tabelle necessarie.


