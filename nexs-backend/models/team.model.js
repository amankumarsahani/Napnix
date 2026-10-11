const { pool } = require('../config/database');

// Shared WHERE for list + count. Role lives on users (team_members has no role column).
function listWhere(filters, params) {
    let where = ' WHERE 1=1';
    if (filters.status) {
        where += ' AND tm.status = ?';
        params.push(filters.status);
    }
    if (filters.department) {
        where += ' AND tm.department = ?';
        params.push(filters.department);
    }
    if (filters.search) {
        const term = `%${String(filters.search).replace(/[\\%_]/g, '\\$&')}%`;
        where += ' AND (tm.name LIKE ? OR tm.email LIKE ? OR tm.position LIKE ? OR tm.department LIKE ?)';
        params.push(term, term, term, term);
    }
    return where;
}

const TeamModel = {
    // Get all team members
    async getAll(filters = {}) {
        try {
            const params = [];
            let query = 'SELECT tm.*, u.role FROM team_members tm LEFT JOIN users u ON u.email = tm.email'
                + listWhere(filters, params);

            query += ' ORDER BY tm.created_at DESC';

            const limit = parseInt(filters.limit) || 10;
            const page = parseInt(filters.page) || 1;
            const offset = (page - 1) * limit;
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    async count(filters = {}) {
        const params = [];
        const query = 'SELECT COUNT(*) as total FROM team_members tm' + listWhere(filters, params);
        const [rows] = await pool.query(query, params);
        return rows[0].total;
    },

    // Get team member by ID
    async getById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT tm.*, u.role FROM team_members tm LEFT JOIN users u ON u.email = tm.email WHERE tm.id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Get team member by email
    async getByEmail(email) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM team_members WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Create new team member
    async create(teamData) {
        try {
            const {
                name,
                email,
                phone,
                position,
                department,
                workload = 0,
                status = 'active',
                joinDate
            } = teamData;

            const [result] = await pool.query(
                `INSERT INTO team_members 
                (name, email, phone, position, department, workload, status, joinDate) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, phone, position, department, workload, status, joinDate]
            );

            return await this.getById(result.insertId);
        } catch (error) {
            throw error;
        }
    },

    // Update team member
    async update(id, teamData) {
        try {
            const updates = [];
            const values = [];

            // Build dynamic update query
            const allowedFields = ['name', 'email', 'phone', 'position', 'department', 'workload', 'status', 'joinDate'];

            allowedFields.forEach(field => {
                if (teamData[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    values.push(teamData[field]);
                }
            });

            const ROLES = ['admin', 'manager', 'sales_operator', 'user'];
            const role = ROLES.includes(teamData.role) ? teamData.role : null;

            if (updates.length === 0 && !role) {
                throw new Error('No valid fields to update');
            }

            if (updates.length) {
                values.push(id);
                await pool.query(
                    `UPDATE team_members SET ${updates.join(', ')} WHERE id = ?`,
                    values
                );
            }

            // Role is the login account's role; it was silently dropped before
            if (role) {
                await pool.query(
                    'UPDATE users u JOIN team_members tm ON tm.email = u.email SET u.role = ? WHERE tm.id = ?',
                    [role, id]
                );
            }

            return await this.getById(id);
        } catch (error) {
            throw error;
        }
    },

    // Delete team member
    async delete(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM team_members WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Get team statistics
    async getStats() {
        try {
            const [totalCount] = await pool.query(
                'SELECT COUNT(*) as total FROM team_members'
            );

            const [statusBreakdown] = await pool.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM team_members
                GROUP BY status
            `);

            const [departmentBreakdown] = await pool.query(`
                SELECT 
                    department,
                    COUNT(*) as count,
                    AVG(workload) as avgWorkload
                FROM team_members
                WHERE department IS NOT NULL
                GROUP BY department
                ORDER BY count DESC
            `);

            const [recentMembers] = await pool.query(
                'SELECT * FROM team_members ORDER BY created_at DESC LIMIT 5'
            );

            return {
                total: totalCount[0].total,
                byStatus: statusBreakdown,
                byDepartment: departmentBreakdown,
                recentMembers
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = TeamModel;
