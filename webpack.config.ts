import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';

const config = async (env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    module: {
        rules: [
            {
                test: /\.geojson$/,
                type: 'json',
            }
        ],
    },

    output: {
      asyncChunks: true,
    },
    
  });
};

export default config;