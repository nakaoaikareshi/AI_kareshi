$env:PGPASSWORD = 'fntmss1992'
Write-Host "Creating database nakao_kareshi_db..."
psql -U postgres -c "DROP DATABASE IF EXISTS nakao_kareshi_db;"
psql -U postgres -c "CREATE DATABASE nakao_kareshi_db;"
Write-Host "Database created successfully!"