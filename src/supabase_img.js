const { data } = supabase
  .storage
  .from('images') // Your bucket name
  .getPublicUrl('public/stock8.jpeg') // The file path inside the bucket

console.log(data.publicUrl) 
// Output: https://your-project.supabase.co/storage/v1/object/public/images/public/stock8.jpeg