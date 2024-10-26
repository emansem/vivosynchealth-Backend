import { connection } from "../config/database/mysql"

export const executeQuery = <T>(sql: string, values?: any[]): Promise<T> => {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            return resolve(result as T);
        });
    });
}