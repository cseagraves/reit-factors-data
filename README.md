# REIT Factors Data

Repository for REIT factor data management and processing. This project automates the process of importing REIT factors data into a Supabase database.

## Structure
- `/data/raw`: Raw CSV data files
- `/data/processed`: Processed data ready for import
- `/scripts`: Data processing and import scripts
- `/.github/workflows`: GitHub Actions workflow definitions

## Setup

### Prerequisites
- Node.js (v16+)
- npm
- Supabase account with a project and table created

### Database Setup
In your Supabase project, create a table named `reit_factors` with the following columns:
- `ym` (text, primary key): Year-month in the format YYYY-MM
- `size_factor` (numeric): Size factor
- `value_factor` (numeric): Value factor
- `mom_factor` (numeric): Momentum factor
- `qual_factor` (numeric): Quality factor
- `lowvol_factor` (numeric): Low volatility factor
- `rev_factor` (numeric): Reversal factor
- `ewtret` (numeric): Equal-weighted total return
- `vwtret` (numeric): Value-weighted total return

### Environment Setup
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   cp .env.example .env
   ```
3. Edit `.env` with your actual Supabase URL and service role key
4. Run `npm install` to install dependencies

## Usage

### Manual Import
To manually import the REIT factors data using the simplified command:
```
npm run import:reit
```

Or with the full path:
```
npm run import data/raw/REIT_Factors_Mar2025.csv
```

Or directly using Node:
```
node scripts/import-factors.js data/raw/REIT_Factors_Mar2025.csv
```

### Automated Imports
This repository is configured with GitHub Actions to automatically run imports:
- Scheduled runs on the 1st of each month at 2 AM UTC
- Manual triggers from the GitHub Actions interface

To set up automated imports:
1. Add your Supabase credentials as GitHub repository secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. The workflow is already configured to use `data/raw/REIT_Factors_Mar2025.csv`
3. Commit and push your changes

## CSV Format Requirements
The import script expects the following CSV format:
- Header row with columns: ym, size_factor, value_factor, mom_factor, qual_factor, lowvol_factor, rev_factor, ewtret, vwtret
- Year-month format in the ym column (e.g., "1987m1")
- Numeric values for all factor columns

## Data Governance
For best practices in managing your REIT factors data:
- Store raw data files in the `data/raw` directory
- Version control your data files to track changes
- Document any changes to data structure
- Run validation checks before committing new data
 
