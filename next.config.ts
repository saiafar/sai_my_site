import type { NextConfig } from 'next';

const config: NextConfig = {
  // onnxruntime y sharp cargan binarios nativos: el bundler no puede
  // empaquetarlos y debe dejarlos como require() en tiempo de ejecución.
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node', 'sharp'],
};

export default config;
