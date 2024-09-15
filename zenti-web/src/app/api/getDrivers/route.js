import { createClient } from '/utils/supabase/server';

export async function GET(request) {
  const supabase = createClient();

  let { data: conductores, error } = await supabase
    .from('conductores')
    .select(`
      id,
      nombre,
      contact,
      image_link
    `);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch drivers' }), { status: 500 });
  }

  // Si quieres hacer algún procesamiento adicional, por ejemplo, para formatear o ajustar datos:
  const drivers = conductores.map(driver => ({
    id: driver.id,
    name: driver.nombre,
    contact: driver.contact,
    image: driver.image_link,
  }));

  // Devolver los conductores en formato JSON
  return new Response(JSON.stringify(drivers), { status: 200 });
}
