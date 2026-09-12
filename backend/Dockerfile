# Fase 1: Compila il codice usando Gradle
FROM gradle:8.11-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle bootJar --no-daemon

# Fase 2: Crea l'ambiente leggero per far girare l'app
FROM eclipse-temurin:21-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# Render assegna la porta reale tramite la variabile d'ambiente PORT
# (application.properties la legge con server.port=${PORT:8080}).
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
