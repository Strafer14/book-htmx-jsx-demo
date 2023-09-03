import * as elements from "typed-html";
import { Book } from "./model/Book";

export const DeleteButton = ({ bookId }: { bookId: string }) => {
  return (
    <button hx-delete={`/delete/${bookId}`} class="btn btn-primary">
      Delete
    </button>
  );
};

export const EditButton = ({ bookId }: { bookId: string }) => {
  return (
    <button class="btn btn-primary" hx-get={`/get-edit-form/${bookId}`}>
      Edit Book
    </button>
  );
};

export const SaveButton = ({ bookId }: { bookId: string }) => {
  return (
    <button
      class="btn btn-primary"
      hx-put={`/update/${bookId}`}
      hx-include="closest tr"
    >
      Save
    </button>
  );
};

export const CancelButton = ({ bookId }: { bookId: string }) => {
  return (
    <button class="btn btn-primary" hx-get={`/get-book-row/${bookId}`}>
      Cancel
    </button>
  );
};

export const BookInfoRow = ({ name, author, id: bookId }: Book) => {
  return (
    <tr>
      <td>{name}</td>
      <td>{author}</td>
      <td>
        <EditButton bookId={bookId} />
      </td>
      <td>
        <DeleteButton bookId={bookId} />
      </td>
    </tr>
  );
};

export const UpdateStateRow = ({ name, author, id }: Book) => {
  return (
      <tr hx-trigger="cancel" class="editing" hx-get={`/get-book-row/${id}`}>
      <td>
        <input name="title" value={name} />
      </td>
      <td>
        <input name="author" value={author} />
      </td>
      <td>
        <SaveButton bookId={id} />
        <CancelButton bookId={id} />
      </td>
    </tr>
  );
};
