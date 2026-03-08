FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# copy project
COPY . .

# give mvnw permission
RUN chmod +x mvnw

# build the jar
RUN ./mvnw clean package -DskipTests

# expose port
EXPOSE 8080

# run spring boot
CMD ["java","-jar","target/FindPlaces-0.0.1-SNAPSHOT.jar"]