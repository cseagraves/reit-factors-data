import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Format year-month values from "1987m1" to "1987-01"
function formatYearMonth(ymString) {
  // Convert formats like "1987m1" to "1987-01"
  const match = ymString.match(/(\d{4})m(\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    return `${year}-${month}`;
  }
  return ymString; // Return as-is if format is different
}

async function importFactors(filePath) {
  console.log(`Starting import from ${filePath}`);
  
  try {
    // Read and parse CSV
    const fileContent = fs.readFileSync(path.resolve(filePath), 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        if (context.column === 'ym') return value;
        return Number(value);
      }
    });
    
    console.log(`Found ${records.length} records to import`);
    
    // Transform and validate data
    const validRecords = records.map(record => ({
      ...record,
      ym: formatYearMonth(record.ym)
    })).filter(record => {
      // Basic validation - ensure required fields exist
      if (!record.ym) {
        console.warn(`Invalid record format, missing ym: ${JSON.stringify(record)}`);
        return false;
      }
      
      // Check for required factor fields
      const requiredColumns = ['size_factor', 'value_factor', 'mom_factor', 'qual_factor', 'lowvol_factor', 'rev_factor', 'ewtret', 'vwtret'];
      const missingColumns = requiredColumns.filter(column => record[column] === undefined);
      
      if (missingColumns.length > 0) {
        console.warn(`Record missing required columns (${missingColumns.join(', ')}): ${JSON.stringify(record)}`);
        return false;
      }
      
      return true;
    });
    
    console.log(`After validation: ${validRecords.length} valid records`);
    
    // Split into batches to avoid request size limits
    const batchSize = 100;
    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize);
      
      // Upsert to Supabase (update if exists, insert if not)
      const { data, error } = await supabase
        .from('reit_factors')
        .upsert(batch, { 
          onConflict: 'ym',
          returning: 'minimal' 
        });
      
      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Successfully imported batch ${i / batchSize + 1} of ${Math.ceil(validRecords.length / batchSize)}`);
      }
    }
    
    console.log('Import completed successfully');
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Allow running from command line with: node import-factors.js path/to/file.csv
if (process.argv.length > 2) {
  importFactors(process.argv[2]);
}

export { importFactors }; 