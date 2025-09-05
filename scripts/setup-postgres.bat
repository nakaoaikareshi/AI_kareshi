@echo off
echo =======================================
echo PostgreSQL Database Setup
echo =======================================
echo.
echo Please enter PostgreSQL password when prompted...
echo.

REM Create database
echo Creating database nakao_kareshi_db...
psql -U postgres -W -c "DROP DATABASE IF EXISTS nakao_kareshi_db;"
psql -U postgres -W -c "CREATE DATABASE nakao_kareshi_db;"

echo.
echo Database created successfully!
echo.
echo Now running Prisma migration...
cd ..
npm run db:push

echo.
echo Setup complete!
pause