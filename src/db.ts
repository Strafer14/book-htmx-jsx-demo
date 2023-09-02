import { DataSource } from "typeorm";
import { Book } from "./model/Book";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: undefined,
  database: "postgres",
  synchronize: true,
  logging: false,
  entities: [Book],
  subscribers: [],
  migrations: [],
});

export const getDataSource = async () => {
  try {
    const connection = await AppDataSource.initialize();
    return {
      connection,
      [Symbol.asyncDispose]: async () => {
        await connection.destroy();
      },
    };
  } catch (error) {
    console.error(error);
  }
};
