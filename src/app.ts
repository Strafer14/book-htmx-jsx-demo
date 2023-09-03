import "reflect-metadata";

// for Symbol.asyncDispose
import "core-js/modules/esnext.disposable-stack.constructor.js";
import "core-js/modules/esnext.symbol.async-dispose.js";
import "core-js/modules/esnext.symbol.dispose.js";

import bodyParser from "body-parser";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getDataSource } from "./db";
import { Book } from "./model/Book";
import { UpdateStateRow, BookInfoRow } from "./components";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set('views', path.join(__dirname, '/views'));

app.get("/", async (request, response) => {
  await using AppDataSource = await getDataSource();
  if (!AppDataSource) {
    return response.status(500).json({"error": "no connection"});
  }
  const bookRepository = AppDataSource.connection.getRepository(Book);
  const [books, bookCount] = (await bookRepository.findAndCount());
  return response.render("index", { books, bookCount });
});

app.post("/submit", async (request, response) => {
  await using AppDataSource = await getDataSource();
  if (!AppDataSource) {
    return response.status(500).json({"error": "no connection"});
  }  
  const bookRepository = AppDataSource.connection.getRepository(Book);
  const book = {
    name: request.body.title,
    author: request.body.author,
  };
  const createdBook = await bookRepository.save(book);
  return response.send(BookInfoRow(createdBook));
});

app.delete("/delete/:id", async (request, response) => {
  await using AppDataSource = await getDataSource();
  if (!AppDataSource) {
    return response.status(500).json({"error": "no connection"});
  }
  const bookRepository = AppDataSource.connection.getRepository(Book);
  const id = request.params.id;
  await bookRepository.delete(id);
  return response.send("");
});

app.get("/get-book-row/:id", async (request, response) => {
  await using AppDataSource = await getDataSource();
  if (!AppDataSource) {
    return response.status(500).json({"error": "no connection"});
  }
  const bookRepository = AppDataSource.connection.getRepository(Book);
  const id = request.params.id;
  const book = await bookRepository.findOne({ where: { id } });
  if (!book) {
    return response.status(404).end();
  }
  return response.send(BookInfoRow(book));
});

app.get("/get-edit-form/:id", async (request, response) => {
  await using AppDataSource = await getDataSource();
  if (!AppDataSource) {
    return response.status(500).json({"error": "no connection"});
  }
  const bookRepository = AppDataSource.connection.getRepository(Book);
  const id = request.params.id;
  const book = await bookRepository.findOne({ where: { id } });
  if (!book) {
    return response.status(404).end();
  }
  return response.send(UpdateStateRow(book));
});

app.put("/update/:id", async (request, response) => {
  await using AppDataSource = await getDataSource();
  if (!AppDataSource) {
    return response.status(500).json({"error": "no connection"});
  }
  const bookRepository = AppDataSource.connection.getRepository(Book);
  const id = request.params.id;
  await bookRepository.update(id, {
    name: request.body.title,
    author: request.body.author,
  });
  return response.send(BookInfoRow({
    id: id,
    name: request.body.title,
    author: request.body.author,
  }));
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Service endpoint = http://localhost:${PORT}`);
});
