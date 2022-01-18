import EasyMDE from "easymde";

export default function MarkdownEditor(element, options = {}) {
  return new EasyMDE({
    element,
    toolbar: [
      "bold",
      "italic",
      "strikethrough",
      "heading-3",
      "|",
      "unordered-list",
      "ordered-list",
      "|",
      "image",
      "preview",
    ],
    spellChecker: false,
    maxHeight: "100px",
    status: false,
    ...options,
  });
}
