import type { NextConfig } from 'next';

const config: NextConfig = {
  // onnxruntime y sharp cargan binarios nativos: el bundler no puede
  // empaquetarlos y debe dejarlos como require() en tiempo de ejecución.
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node', 'sharp'],

  // Solo afecta a `next dev`. Next 16 bloquea por defecto los recursos de
  // desarrollo —los paquetes de JavaScript y el canal de recarga en caliente—
  // cuando los pide un origen distinto de localhost. Al abrir el sitio desde
  // otro equipo de la red, el HTML llega pero el JavaScript no, y el síntoma
  // despista: la página se ve, pero la escena de entrada se queda congelada y
  // el asistente no responde, porque ambos dependen de que el cliente arranque.
  //
  // No tiene ningún efecto en producción: allí sirve `next start`, que no expone
  // recursos de desarrollo.
  allowedDevOrigins: ['192.168.1.*'],
};

export default config;
