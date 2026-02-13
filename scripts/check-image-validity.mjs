// Fetch images and check their properties
const images = [
  "https://pdovgefwzxfawuyngrke.supabase.co/storage/v1/object/public/product-images/clearer-board-5-cone-cedar-edited-1-1770972172681.jpg",
  "https://pdovgefwzxfawuyngrke.supabase.co/storage/v1/object/public/product-images/clearer-board-5-cone-cedar-1-1770189264485.jpg",
  "https://pdovgefwzxfawuyngrke.supabase.co/storage/v1/object/public/product-images/clearer-board-5-cone-cedar-edited-3-1770915757875.jpg",
  "https://pdovgefwzxfawuyngrke.supabase.co/storage/v1/object/public/product-images/clearer-board-5-cone-cedar-4-1770189268140.jpg"
];

async function checkImageProperties() {
  console.log('\n🔍 Checking Image Properties for Next.js Compatibility\n');
  
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const filename = url.split('/').pop();
    const isEdited = filename.includes('-edited-');
    
    console.log(`${i + 1}. ${isEdited ? '✏️  [EDITED]' : '📷 [ORIGINAL]'} ${filename}`);
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Check file size
      const sizeKB = Math.round(buffer.length / 1024);
      console.log(`   Size: ${sizeKB} KB`);
      
      // Check JPEG markers
      const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[buffer.length - 2] === 0xFF && buffer[buffer.length - 1] === 0xD9;
      console.log(`   Valid JPEG: ${isJPEG ? '✅ Yes' : '❌ No'}`);
      
      if (!isJPEG) {
        console.log(`   ⚠️  WARNING: File has .jpg extension but invalid JPEG markers!`);
        console.log(`   First bytes: ${buffer.slice(0, 4).toString('hex')}`);
        console.log(`   Last bytes: ${buffer.slice(-4).toString('hex')}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      console.log(`   Content-Type: ${contentType}`);
      
      if (contentType && !contentType.includes('image/jpeg')) {
        console.log(`   ⚠️  WARNING: Content-Type doesn't match file extension!`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

checkImageProperties();
