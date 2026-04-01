const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '../data/raw');
const OUTPUT_FILE = path.join(__dirname, '../data/combined.json');

function combineJsonFiles() {
  console.log('Starting to combine JSON files...');
  
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Directory not found: ${RAW_DIR}`);
    return;
  }

  const files = fs.readdirSync(RAW_DIR).filter(file => file.endsWith('.json'));
  const combinedData = [];
  let successCount = 0;
  let errorCount = 0;

  console.log(`Found ${files.length} JSON files in ${RAW_DIR}`);

  for (const file of files) {
    const filePath = path.join(RAW_DIR, file);
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Skip empty files
      if (!fileContent.trim()) {
        console.warn(`Warning: File ${file} is empty, skipping.`);
        continue;
      }

      const jsonData = JSON.parse(fileContent);
      
      // Handle both array of objects and single object JSON structure
      if (Array.isArray(jsonData)) {
        combinedData.push(...jsonData);
      } else {
        combinedData.push(jsonData);
      }
      
      successCount++;
    } catch (error) {
      console.error(`Error parsing JSON in file ${file}: ${error.message}`);
      errorCount++;
    }
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combinedData, null, 2), 'utf8');
    console.log(`\nSuccess! Combined ${successCount} files into ${OUTPUT_FILE}`);
    console.log(`Total records in combined file: ${combinedData.length}`);
    if (errorCount > 0) {
      console.warn(`Failed to process ${errorCount} files due to invalid JSON.`);
    }
  } catch (error) {
    console.error(`Error writing combined file: ${error.message}`);
  }
}

combineJsonFiles();
