FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy entire project
COPY . .

# Build jar inside container
RUN ./mvnw clean package -DskipTests

# Run the built jar
CMD ["java","-jar","target/FindPlaces-0.0.1-SNAPSHOT.jar"]