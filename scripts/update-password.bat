@echo off
echo =======================================
echo Update PostgreSQL Password in .env
echo =======================================
echo.
set /p password="Enter your PostgreSQL password: "

echo.
echo Updating .env file...

cd ..
powershell -Command "(Get-Content .env) -replace 'postgresql://postgres:.*@localhost', 'postgresql://postgres:%password%@localhost' | Set-Content .env"

echo.
echo Password updated in .env file!
echo.
echo Testing connection and creating database...
echo.

set PGPASSWORD=%password%
psql -U postgres -c "DROP DATABASE IF EXISTS nakao_kareshi_db;"
psql -U postgres -c "CREATE DATABASE nakao_kareshi_db;"

echo.
echo Running migration...
npm run db:push

echo.
echo Setup complete!
pause