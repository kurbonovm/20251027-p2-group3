# How to Fix the Spring Boot Startup Error

## Problem
The backend is failing with:
```
BeanCreationException: Error creating bean with name 'adminController': Lookup method resolution failed
```

This is a **Spring DevTools + Lombok** conflict that happens when the server tries to hot-reload changes.

## Solution: Fresh Restart

### Step 1: Stop the Current Server

In **Terminal 1**, press:
```
Ctrl + C
```

Wait for the server to fully stop (you'll see the terminal prompt return).

### Step 2: Clean the Target Directory

```bash
cd /Users/aepanda/SkillstormDev2025/p2-group3/20251027-p2-group3/backend
rm -rf target/
```

### Step 3: Set Java 17

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

### Step 4: Verify Java Version

```bash
java -version
```

Should show: `openjdk version "17.0.17"`

### Step 5: Start Fresh

```bash
mvn clean spring-boot:run
```

## Alternative: Use the JAR Directly

If `mvn spring-boot:run` still has issues, run the compiled JAR:

```bash
cd /Users/aepanda/SkillstormDev2025/p2-group3/20251027-p2-group3/backend

# Clean and package
mvn clean package -DskipTests

# Run the JAR
java -jar target/reservation-system-1.0.0.jar
```

## One-Line Command (Copy & Paste)

**Option 1: Maven**
```bash
cd /Users/aepanda/SkillstormDev2025/p2-group3/20251027-p2-group3/backend && export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home && export PATH="$JAVA_HOME/bin:$PATH" && rm -rf target/ && mvn clean spring-boot:run
```

**Option 2: JAR (More Stable)**
```bash
cd /Users/aepanda/SkillstormDev2025/p2-group3/20251027-p2-group3/backend && export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home && export PATH="$JAVA_HOME/bin:$PATH" && mvn clean package -DskipTests && java -jar target/reservation-system-1.0.0.jar
```

## What to Look For

### Success Messages:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

...

Started HotelReservationApplication in X.XXX seconds
```

### If You See Errors:

#### "Address already in use: bind"
Port 8080 is still occupied. Kill the process:
```bash
lsof -ti:8080 | xargs kill -9
```
Then try starting again.

#### "Cannot find symbol" or Lombok errors
Make sure you're using Java 17:
```bash
java -version
```
Should show version 17, not 25.

## Why This Happens

1. **Spring DevTools** tries to hot-reload classes when files change
2. **Lombok** generates methods at compile time
3. DevTools' classloader can't see Lombok-generated methods during reload
4. Spring fails to create the bean

## Prevention

To avoid this in the future:

### Option 1: Disable DevTools (Recommended for Development)

Edit `pom.xml` and comment out:
```xml
<!-- <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency> -->
```

### Option 2: Always Do Clean Restarts

Instead of relying on hot-reload, always restart with:
```bash
mvn clean spring-boot:run
```

## Troubleshooting

### Still Getting Errors?

1. **Check Java version**: Must be 17
   ```bash
   java -version
   mvn -version
   ```

2. **Clear Maven cache**:
   ```bash
   rm -rf ~/.m2/repository/com/hotel/reservation-system/
   ```

3. **Rebuild from scratch**:
   ```bash
   cd backend
   rm -rf target/
   mvn clean install -DskipTests
   mvn spring-boot:run
   ```

4. **Check for other processes on port 8080**:
   ```bash
   lsof -i:8080
   ```

### Backend Logs to Monitor

Look for these in the terminal:
- ✅ `Started HotelReservationApplication` = Success!
- ✅ `Tomcat started on port 8080` = Server is ready
- ❌ `BeanCreationException` = Need to restart fresh
- ❌ `Address already in use` = Kill process on port 8080

## After Successful Start

1. Backend will be at: `http://localhost:8080`
2. Frontend is at: `http://localhost:5173`
3. Test Today's Pulse: Login → Admin Dashboard → See events
4. Check browser console - should be no 500 errors

---

**Quick Fix**: Stop server (Ctrl+C) → Run one-line command above → Wait for "Started" message → Test in browser!

