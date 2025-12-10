# Multi-stage build for smaller image
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Download and install AWS DocumentDB certificate bundle FIRST (as root)
RUN apt-get update && apt-get install -y wget ca-certificates openssl && \
    wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O /tmp/global-bundle.pem && \
    # Split the bundle into individual certificates and import each one
    awk 'BEGIN {c=0} /BEGIN CERTIFICATE/ {c++} {print > "/tmp/cert-" c ".pem"}' /tmp/global-bundle.pem && \
    for cert in /tmp/cert-*.pem; do \
      alias_name=$(basename $cert .pem); \
      keytool -importcert -trustcacerts -file "$cert" \
        -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt -alias "rds-$alias_name" 2>/dev/null || true; \
    done && \
    rm /tmp/*.pem && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Add non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application with JVM optimizations and trust all SSL certificates
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Djavax.net.ssl.trustStore=$JAVA_HOME/lib/security/cacerts", \
  "-Djavax.net.ssl.trustStorePassword=changeit", \
  "-jar", "app.jar"]
