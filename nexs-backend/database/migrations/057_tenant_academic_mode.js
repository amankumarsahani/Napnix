/**
 * Adds `academic_mode` to tenants.
 *
 * Only meaningful for tenants on the `school` industry. 'college' turns on semesters,
 * subject credits, SGPA/CGPA and the backlog register in nexcrm-backend — the schema is
 * a superset, so the value only drives feature exposure, not a different set of tables.
 *
 * Passed to the tenant's PM2 process as `--academic-mode <mode>` by provisioner.js.
 */

module.exports = async function (connection) {
    const alterations = [
        {
            col: 'academic_mode',
            sql: `ADD COLUMN academic_mode ENUM('school','college') DEFAULT NULL AFTER industry_type`
        }
    ];

    for (const { sql } of alterations) {
        try {
            await connection.query(`ALTER TABLE tenants ${sql}`);
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        }
    }
};
