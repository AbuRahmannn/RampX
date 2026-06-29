@echo off
echo ===================================================
echo   RaMix Full Stack Build Script (Windows)
echo ===================================================
echo.

:: 1. Build React Frontend
echo [1/4] Building React Frontend...
cd frontend
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend compilation failed!
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

:: 2. Create Static Folder in Backend
echo.
echo [2/4] Preparing backend static folders...
if not exist "backend\src\main\resources\static" (
    mkdir "backend\src\main\resources\static"
)

:: 3. Copy Frontend Dist to Backend Static
echo.
echo [3/4] Copying compiled assets into Spring Boot resources...
xcopy /E /I /Y "frontend\dist" "backend\src\main\resources\static"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to copy static assets!
    exit /b %ERRORLEVEL%
)

:: 4. Build Spring Boot Executable JAR
echo.
echo [4/4] Packing application with Maven Wrapper...
cd backend
call mvnw.cmd clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend packaging failed!
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

:: Success Message
echo.
echo ===================================================
echo   BUILD COMPLETED SUCCESSFULY!
echo ===================================================
echo   Executable JAR is saved in:
echo   backend/target/ramix-0.0.1-SNAPSHOT.jar
echo.
echo   You can launch the app by running:
echo   java -jar backend/target/ramix-0.0.1-SNAPSHOT.jar
echo.
echo   Then visit: http://localhost:8080
echo ===================================================
