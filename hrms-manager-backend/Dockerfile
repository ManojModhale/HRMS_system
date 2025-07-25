# ---------- Build Stage ----------
FROM eclipse-temurin:17-jdk as builder

# Set the working directory
WORKDIR /app

# Copy Maven wrapper and project files
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make the Maven wrapper executable and download dependencies offline
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy the source code
COPY src ./src

# Build the project and skip tests
RUN ./mvnw clean package -DskipTests

# ---------- Runtime Stage ----------
FROM eclipse-temurin:17-jre

# Set the working directory
WORKDIR /app

# Copy the packaged application JAR from the builder stage
COPY --from=builder /app/target/hrms-manager-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8183

# Set the default port for the application
ENV PORT=8183

# Run the application
CMD ["java", "-jar", "app.jar"]
