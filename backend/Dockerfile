# Use OpenJDK 17 as base image
FROM eclipse-temurin:17-jre-jammy

# Set working directory
WORKDIR /app

# Copy built jar from target (update jar name as needed)
COPY target/*.jar app.jar

# Expose port (default Spring Boot port)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]