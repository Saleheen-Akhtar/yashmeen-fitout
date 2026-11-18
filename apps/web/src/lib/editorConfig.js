import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  Table,
  TableToolbar,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { CustomUploadAdapterPlugin } from "./uploader";

export { ClassicEditor };

export const editorConfig = {
  licenseKey: "GPL",
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Link,
    List,
    BlockQuote,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Table,
    TableToolbar,
  ],
  extraPlugins: [CustomUploadAdapterPlugin],
  toolbar: {
    items: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "bold",
      "italic",
      "link",
      "|",
      "bulletedList",
      "numberedList",
      "blockQuote",
      "|",
      "insertTable",
      "uploadImage",
    ],
    shouldNotGroupWhenFull: false,
  },
  image: {
    toolbar: [
      "toggleImageCaption",
      "imageTextAlternative",
      "|",
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
    ],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: "https://",
  },
};
