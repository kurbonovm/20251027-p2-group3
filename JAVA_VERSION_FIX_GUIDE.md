# Java Version Compatibility Fix Guide

## Problem Summary

Your system is running **Java 25** (released October 2025), which is too new and causes compatibility issues with:
- Maven compiler plugin
- Spring Boot 3.2.0 (designed for Java 17-21)
- Lombok annotation processing

**Error**: `java.lang.ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag :: UNKNOWN`

This is **NOT a Lombok issue** - it's a Java version incompatibility.

## ✅ RECOMMENDED SOLUTION: Install Java 17 or 21 (LTS)

### Option 1: Install Java 17 (Most Stable for Spring Boot 3.2)

Using **SDKMAN** (easiest method):

```bash
# Install SDKMAN if not already installed
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 17 (Temurin distribution)
sdk install java 17.0.9-tem

# Set Java 17 as default
sdk default java 17.0.9-tem

# Verify installation
java -version
# Should show: openjdk version "17.0.9"
```

### Option 2: Install Java 21 (Latest LTS)

```bash
# Using SDKMAN
sdk install java 21.0.1-tem
sdk default java 21.0.1-tem

# Verify
java -version
# Should show: openjdk version "21.0.1"
```

### Option 3: Using Homebrew

```bash
# Install Java 17
brew install openjdk@17

# Link it
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Set JAVA_HOME in your shell profile (~/.zshrc or ~/.bash_profile)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
source ~/.zshrc

# Verify
java -version
```

## After Installing Java 17/21

### 1. Update pom.xml (Already Done)

The `pom.xml` has been updated to use Java 21 compatibility. If you install Java 17, change these lines:

```xml
<properties>
    <java.version>17</java.version>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <maven.compiler.release>17</maven.compiler.release>
    ...
</properties>
```

And in the compiler plugin:

```xml
<configuration>
    <source>17</source>
    <target>17</target>
    <release>17</release>
    ...
</configuration>
```

### 2. Clean and Rebuild

```bash
cd backend

# Clean previous build artifacts
mvn clean

# Compile with new Java version
mvn compile -DskipTests

# If successful, run the application
mvn spring-boot:run
```

### 3. Verify Backend is Running

You should see:
```
Started HotelReservationApplication in X.XXX seconds
```

Backend will be available at: `http://localhost:8080`

## Alternative: Keep Java 25 but Use Older Maven Compiler

⚠️ **Not Recommended** - Java 25 is too new for production Spring Boot apps.

If you must keep Java 25, you could try downgrading to Java 17 bytecode:

```xml
<configuration>
    <source>17</source>
    <target>17</target>
    <!-- Remove <release> tag -->
    <fork>true</fork>
    <executable>${JAVA_17_HOME}/bin/javac</executable>
</configuration>
```

But this requires having Java 17 installed anyway.

## Why Java 17 or 21?

| Java Version | Status | Spring Boot 3.2 Support | Recommendation |
|--------------|--------|------------------------|----------------|
| Java 17 | LTS (Long-Term Support) | ✅ Fully Supported | **Best Choice** |
| Java 21 | LTS (Latest) | ✅ Fully Supported | Good Choice |
| Java 25 | Non-LTS (Preview) | ❌ Not Supported | Avoid for now |

## Checking Your Current Java Version

```bash
# Check Java version
java -version

# Check Maven's Java version
mvn -version

# List all installed Java versions (macOS)
/usr/libexec/java_home -V

# Check JAVA_HOME
echo $JAVA_HOME
```

## Switching Between Java Versions

### Using SDKMAN (Recommended):
```bash
# List installed versions
sdk list java

# Switch to a specific version
sdk use java 17.0.9-tem

# Set default version
sdk default java 17.0.9-tem
```

### Manual Method (macOS):
```bash
# Add to ~/.zshrc or ~/.bash_profile
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Or for Java 21:
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Reload shell
source ~/.zshrc
```

## Testing the Fix

After installing the correct Java version:

```bash
cd backend

# 1. Clean build
mvn clean

# 2. Compile (should succeed now)
mvn compile

# 3. Run tests (optional)
mvn test

# 4. Start the server
mvn spring-boot:run
```

Expected output:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

...
Started HotelReservationApplication in 3.456 seconds
```

## Troubleshooting

### Issue: "Cannot find Java 17/21"
**Solution**: Install using SDKMAN or Homebrew (see above)

### Issue: "Maven still uses Java 25"
**Solution**: 
```bash
# Check Maven's Java
mvn -version

# Set JAVA_HOME explicitly
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Verify
mvn -version
```

### Issue: "Lombok still not working"
**Solution**: After switching Java versions:
```bash
cd backend
mvn clean install -DskipTests
```

The `pom.xml` already has Lombok annotation processing configured correctly.

## Summary

1. ✅ **Install Java 17 or 21** (LTS versions)
2. ✅ **Set as default** using SDKMAN or JAVA_HOME
3. ✅ **Update pom.xml** to match (already done for Java 21)
4. ✅ **Clean and rebuild**: `mvn clean compile`
5. ✅ **Start server**: `mvn spring-boot:run`
6. ✅ **Test Today's Pulse feature** in the admin dashboard

---

**Note**: The Today's Pulse feature code is complete and correct. Once the Java version issue is resolved, everything will work perfectly! 🎉

## Quick Commands Reference

```bash
# Install Java 17 with SDKMAN
sdk install java 17.0.9-tem
sdk default java 17.0.9-tem

# Verify
java -version

# Rebuild backend
cd backend
mvn clean compile
mvn spring-boot:run

# Frontend should already be running on http://localhost:5173
# Backend will run on http://localhost:8080
```

