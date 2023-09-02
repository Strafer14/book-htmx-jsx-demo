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
  return response.send(`<tr>
      <td>${request.body.title}</td>
      <td>${request.body.author}</td>
      <td>
          <button class="btn btn-primary"
              hx-get="/get-edit-form/${createdBook.id}">
              Edit Book
          </button>
      </td>
      <td>
          <button hx-delete="/delete/${createdBook.id}"
              class="btn btn-primary">
              Delete
          </button>
      </td>
  </tr>`);
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
  return response.send(`<tr>
    <td>${book.name}</td>
    <td>${book.author}</td>
    <td>
        <button class="btn btn-primary"
            hx-get="/get-edit-form/${id}">
            Edit Book
        </button>
    </td>
    <td>
        <button hx-delete="/delete/${id}"
            class="btn btn-primary">
            Delete
        </button>
    </td>
</tr>`);
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
  return response.send(`<tr hx-trigger='cancel' class='editing' hx-get="/get-book-row/${id}">
    <td><input name="title" value="${book.name}"/></td>
    <td><input name="author" value="${book.author}"/></td>
    <td>
      <button class="btn btn-primary" hx-get="/get-book-row/${id}">
        Cancel
      </button>
      <button class="btn btn-primary" hx-put="/update/${id}" hx-include="closest tr">
        Save
      </button>
    </td>
  </tr>`);
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
  return response.send(`<tr>
    <td>${request.body.title}</td>
    <td>${request.body.author}</td>
    <td>
        <button class="btn btn-primary"
            hx-get="/get-edit-form/${id}">
            Edit Book
        </button>
    </td>
    <td>
        <button hx-delete="/delete/${id}"
            class="btn btn-primary">
            Delete
        </button>
    </td>
</tr>`);
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Service endpoint = http://localhost:${PORT}`);
});
