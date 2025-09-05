@echo off
set PGPASSWORD=fntmss1992
echo Creating database...
psql -U postgres -c "CREATE DATABASE nakao_kareshi_db;"
echo Database created successfully!
echo Running migrations...
cd ..
npm run db:push
echo Setup complete!