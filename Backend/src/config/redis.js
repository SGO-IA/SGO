import Redis from 'ioredis';

const redis = new Redis({
  // CAMBIO AQUÍ: Usamos la variable de entorno, y si no existe, el nombre del servicio
  host: process.env.REDIS_HOST || 'sgo-redis', 
  port: parseInt(process.env.REDIS_PORT) || 6379,
  connectTimeout: 10000,
  family: 4,
  reconnectOnError: (err) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redis.on('connect', () => {
  console.log('🚀 Redis: Conectado exitosamente a ' + (process.env.REDIS_HOST || 'sgo-redis'));
});

redis.on('error', (err) => {
  console.error('❌ Redis: Error detectado:', err.message);
});

export default redis;