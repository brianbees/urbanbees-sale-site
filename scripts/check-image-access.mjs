// Check if images are accessible
const images = [
  "https://pdovgefwzxfawuyngrke.supabase.co/storage/v1/object/public/product-images/clearer-board-5-cone-cedar-edited-1-1770972172681.jpg",
  "https://pdovgefwzxfawuyngrke.supabase.co/storage/v1/object/public/product-images/clearer-board-5-cone-cedar-1-1770189264485.jpg",
  "https://pdovgefwzxfawuyngrke.supabase.co/storage/v1/object/public/product-images/clearer-board-5-cone-cedar-edited-3-1770915757875.jpg",
  "https://pdovgefwzxfawuyngrke.supabase.co/storage/v1/object/public/product-images/clearer-board-5-cone-cedar-4-1770189268140.jpg"
];

async function checkImages() {
  console.log('\n🔍 Checking image accessibility...\n');
  
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const filename = url.split('/').pop();
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const status = response.status;
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      if (status === 200) {
        console.log(`✅ Image ${i + 1}: ${filename}`);
        console.log(`   Status: ${status}`);
        console.log(`   Type: ${contentType}`);
        console.log(`   Size: ${contentLength ? Math.round(parseInt(contentLength) / 1024) + ' KB' : 'unknown'}`);
      } else {
        console.log(`❌ Image ${i + 1}: ${filename}`);
        console.log(`   Status: ${status}`);
      }
    } catch (error) {
      console.log(`❌ Image ${i + 1}: ${filename}`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }
}

checkImages();
