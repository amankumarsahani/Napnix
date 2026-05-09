/**
 * Migration: 043_enhance_telemetry_geo
 * Adds ip_address, latitude, longitude, timezone, isp columns to the
 * telemetry table to support richer geo-location enrichment.
 */

module.exports = async function (connection) {
    const alterations = [
        { col: 'ip_address', sql: 'ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL AFTER user_id' },
        { col: 'latitude',   sql: 'ADD COLUMN latitude DECIMAL(9,6) DEFAULT NULL AFTER region' },
        { col: 'longitude',  sql: 'ADD COLUMN longitude DECIMAL(9,6) DEFAULT NULL AFTER latitude' },
        { col: 'timezone',   sql: 'ADD COLUMN timezone VARCHAR(60) DEFAULT NULL AFTER longitude' },
        { col: 'isp',        sql: 'ADD COLUMN isp VARCHAR(120) DEFAULT NULL AFTER timezone' },
    ];

    for (const alt of alterations) {
        try {
            await connection.query(`ALTER TABLE telemetry ${alt.sql}`);
            console.log(`   + telemetry.${alt.col} added`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`   ~ telemetry.${alt.col} already exists, skipping`);
            } else {
                throw err;
            }
        }
    }
};
