@echo off
echo ===================================================
echo   Starting RaMix Music Application...
echo ===================================================
echo.
if not exist "backend\target\ramix-0.0.1-SNAPSHOT.jar" (
    echo [ERROR] Application JAR not found! Please run 'build.bat' first to compile the project.
    pause
    exit /b 1
)

java -jar backend\target\ramix-0.0.1-SNAPSHOT.jar
