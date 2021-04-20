module.exports = {
    apps: [
        {
            name: 'VideoPlaySpeedChangerAPI',
            script: 'index.js',
            source_map_support: false,
            env_production: {
                'NODE_ENV': 'production'
            },
            exec_mode: 'cluster',
            instances: 0,
            combine_logs: true,
            out_file: 'logs/log.log',
            error_file: 'logs/error.log'
        }
    ]
};