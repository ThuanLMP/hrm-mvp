import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("hr_db", {
  migrations: "./migrations",
});
