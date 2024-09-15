import { createClient } from '/utils/supabase/server';

export async function GET(request) {
  const supabase = createClient();

  // 1. Obtener información de los vehículos y conductores
  let { data: trucksData, error: trucksError } = await supabase
    .from('vehicles')
    .select(`
      id,
      plate,
      start_time,
      status,
      current_lat,
      current_long,
      conductores (id, nombre, contact, image_link),
      route_id
    `);

  if (trucksError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch trucks' }), { status: 500 });
  }

  // 2. Obtener información de los paquetes basados en las rutas de los vehículos obtenidos
  const routeIds = trucksData.map(truck => truck.route_id); // Obtener todos los route_ids de los vehículos
  let { data: packagesData, error: packagesError } = await supabase
    .from('packages')
    .select(`
      id,
      status,
      route_id
    `)
    .in('route_id', routeIds); // Filtrar los paquetes solo por las rutas obtenidas

  if (packagesError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch packages' }), { status: 500 });
  }

  // 3. Procesar los datos de vehículos y asociar los paquetes correspondientes
  const trucks = trucksData.map(truck => {
    // Filtrar los paquetes que corresponden a la ruta del vehículo
    const truckPackages = packagesData.filter(pkg => pkg.route_id === truck.route_id);

    // Calcular el progreso de los paquetes para la ruta del vehículo
    const totalPackages = truckPackages.length;
    const deliveredPackages = truckPackages.filter(pkg => pkg.status === 'delivered').length;
    const onRoutePackages = truckPackages.filter(pkg => pkg.status === 'on route').length;
    const rescheduledPackages = truckPackages.filter(pkg => pkg.status === 'reschedule').length;

    // Progreso calculado de los paquetes
    const progress = {
      total: totalPackages,
      delivered: deliveredPackages,
      onRoute: onRoutePackages,
      rescheduled: rescheduledPackages
    };

    // Retornar los datos del vehículo, conductor y progreso de la ruta
    return {
      vehicleId: truck.id,
      plate: truck.plate,
      startTime: truck.start_time,
      status: truck.status,
      currentLocation: {
        lat: truck.current_lat,
        long: truck.current_long
      },
      conductor: {
        name: truck.conductores.nombre,
        contact: truck.conductores.contact,
        image: truck.conductores.image_link
      },
      routeProgress: progress
    };
  });

  // Devolver los datos en formato JSON
  return new Response(JSON.stringify(trucks), { status: 200 });
}
