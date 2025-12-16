# Use OpenJDK 21 base image
FROM openjdk:21-slim

# Set working directory
WORKDIR /app

# Copy jar into image
COPY target/*.jar pmo-mgmt-portal.jar

# Expose Spring Boot port
EXPOSE 8081

# Run the app
ENTRYPOINT ["java", "-jar", "pmo-mgmt-portal.jar"]