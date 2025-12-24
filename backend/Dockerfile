# Multi-stage build for optimized image size
FROM maven:3.9-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application (skip tests for faster build)
RUN mvn clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre

# Install wget for health check and curl for downloading certificates
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Download DocumentDB SSL certificate
RUN mkdir -p /app/certs && \
    curl -o /app/certs/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Set working directory
WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application with DocumentDB SSL support
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Djavax.net.ssl.trustStore=/app/certs/global-bundle.pem", \
  "-Djavax.net.ssl.trustStoreType=pem", \
  "-Xms512m", \
  "-Xmx1024m", \
  "-XX:+UseG1GC", \
  "-jar", \
  "app.jar"]

