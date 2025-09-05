$env:PGPASSWORD = 'fntmss1992'
Write-Host "Testing PostgreSQL connection..."
psql -U postgres -c "SELECT version();"