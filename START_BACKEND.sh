#!/bin/bash

# Start Backend Server with Java 17
# This script ensures Java 17 is used to run the Spring Boot application

echo "========================================="
echo "Starting Hotel Reservation Backend"
echo "========================================="
echo ""

# Set Java 17 as the active Java version
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

# Verify Java version
echo "Using Java version:"
java -version
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

echo "Starting Spring Boot application..."
echo "Backend will be available at: http://localhost:8080"
echo ""

# Start the application
mvn spring-boot:run

